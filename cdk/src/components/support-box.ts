import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type * as efs from 'aws-cdk-lib/aws-efs'
import type { AmplifyAwsSubdomain } from './amplify-aws-subdomain'

export interface SupportBoxProps {
  /**
   * Filesystem to be used for storing the application's data.
   */
  filesystem: efs.FileSystem

  /**
   * Subdomain (if exists)
   */
  subdomain: AmplifyAwsSubdomain | undefined

  /**
   * VPC
   */
  vpc: ec2.Vpc
}

/**
 * The support box is used for accessing filesystem and performing manual database migrations
 */
export class SupportBox extends Construct {
  private readonly appName: string = this.node.tryGetContext('app')
  private readonly envName: string = this.node.tryGetContext('env')

  public readonly bucket: s3.Bucket

  constructor(scope: Construct, id: string, props: SupportBoxProps) {
    super(scope, id)

    const { filesystem, subdomain, vpc } = props

    const role = new iam.Role(this, 'SupportBoxRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    })

    const securityGroup = new ec2.SecurityGroup(
      this,
      'SupportBoxSecurityGroup',
      {
        vpc,
        allowAllOutbound: true,
        securityGroupName: 'support-box-sg',
      }
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    )

    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      role,
      instanceName: 'support-box',
      instanceType: ec2.InstanceType.of(
        // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      // create the key manually in the AWS console
      keyName: `support-box-key-${this.envName}`,
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup,
    })

    // TODO: fix this
    const scriptSetupNode = [
      'curl -fsSL https://fnm.vercel.app/install | bash', // install https://fnm.vercel.app
      'fnm install --lts', // TODO: install same Node version from root .nvmrc
      'npm i -g prisma', // TODO: install same prisma version from root package.json
    ]

    filesystem.connections.allowDefaultPortFrom(instance)
    // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-efs-readme.html#mounting-the-file-system-using-user-data
    instance.userData.addCommands(
      'yum check-update -y', // Ubuntu: apt-get -y update
      'yum upgrade -y', // Ubuntu: apt-get -y upgrade
      'yum install -y amazon-efs-utils', // Ubuntu: apt-get -y install amazon-efs-utils
      'yum install -y nfs-utils', // Ubuntu: apt-get -y install nfs-common
      'file_system_id_1=' + filesystem.fileSystemId,
      'efs_mount_point_1=/mnt/efs',
      'mkdir -p "${efs_mount_point_1}"',
      'test -f "/sbin/mount.efs" && echo "${file_system_id_1}:/ ${efs_mount_point_1} efs defaults,_netdev" >> /etc/fstab || ' +
        'echo "${file_system_id_1}.efs.' +
        Stack.of(this).region +
        '.amazonaws.com:/ ${efs_mount_point_1} nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0" >> /etc/fstab',
      'mount -a -t efs,nfs4 defaults',
      ...scriptSetupNode
    )

    // create bucket for SQLite backups with Litestream
    const bucket = new s3.Bucket(this, 'SupportBucket', {
      bucketName: `${this.appName}-${this.envName}-bucket`,
    })
    this.bucket = bucket
    bucket.grantReadWrite(instance.role)

    // set up DNS record for the CloudFront distribution if subdomain exists
    if (subdomain) {
      const record = new route53.ARecord(this, 'AliasRecordSupport', {
        target: route53.RecordTarget.fromIpAddresses(instance.instancePublicIp),
        zone: subdomain.hostedZone,
        recordName: `support.${this.envName}`,
      })

      // outputs public IP of the instance
      new cdk.CfnOutput(this, 'DomainOutput', {
        value: record.domainName,
      })
    }
  }
}
