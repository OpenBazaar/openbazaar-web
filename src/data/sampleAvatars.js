const avatars = [
  {
    tiny: 'zb2rhgF7exkX7Q6MewQTZR1hTSm21ozRtr9jQbiF9T86zUVAA',
    small: 'zb2rhZvoqatGNLjJ8KDfthhTVA71T9efyKf7jQjjhLHxh4Jpx',
    medium: 'zb2rhacixKZqV2Nxu3qLThGbG9GDRH2XJdGxFQjmx6FR6NzhS',
    original: 'zb2rhXQu1ftk3dG6Pmb9d9Q1VUxhWKyzuLYexwfnvkEQ3uzsh',
    large: 'zb2rhjtMCL1sfoPHuH3n25nJbepEk8jXiVuGDBpzjcm14eP8D'
  },
  {
    tiny: 'zb2rhcMPQ2bDfMa6aRCNMVyusng5nJVyr3dsVTLw14cN79AA2',
    small: 'zb2rhapZ1BukXJSpuh7nrXssnbNLmW8mRC6xq1Mc9BXtcXqXE',
    medium: 'zb2rhZzQqGmZ4sAd1WwD7eEZAgJmWU9h2SNnXJ8owbNXXyqL9',
    original: 'zb2rhh2wnBDdLSaa15x2ancGbMYp2UUVGc7BU36VHeCi2j7hj',
    large: 'zb2rhaa9VnX7vwDk8P6Zyapy8zUzd4iEkmXdT7ztqXmQmfSmK'
  },
  {
    tiny: 'zb2rhobBHtSs9cQvYtgK1tLPxYUV3wtxQGP8ZuvDEpH62qyvM',
    small: 'zb2rhkJSKD4S5MQxRTSk8wU8N5tTG6eavUDFxtPFc46WD1Dqg',
    medium: 'zb2rhnShXCUqQN5CMZsdod7yVQoa3gN2rd6PCAhL7QXUEpFzD',
    original: 'zb2rhaMb4HYySMfmsnHkrWix9xP6MPTmJKpLTYuuWgBaZJgrH',
    large: 'zb2rhbYgqekfN1Kv2QS2BkFcC16UhZrdQmu9eb4WVmfMX1Pxe'
  },
  {
    tiny: 'zb2rhcHgDaQKf4JnnapeDYF6naFy25ABAwQogkUcWi6J1x97B',
    small: 'zb2rhZ3CCZS8tdD7fvgrA6SbuEA8yg5FNQXKcm5aEiZHXCKRw',
    medium: 'zb2rhhc72GbmzfVmcP8WdYdzPDSFx6PRDaqiCspx2wNpxBDLp',
    original: 'zb2rhjiTjMEEiW2ytUY26sZQcJp1BhMs4TKuzZL1AjKUugqQs',
    large: 'zb2rhmGsdP8zZVmrqw24koa2esfgfkE2JnzEwAL6dXf4AeEBo'
  },
  {
    tiny: 'zb2rhhcNmCvrRqgM3PTfiC5HKERwxeLdELaEfbkQWUY6Lw5tV',
    small: 'zb2rheuxsxVZoXvasnN1f6mdCNeo93f9b8SQBaycgcqo8UXyK',
    medium: 'zb2rhkCN2VagxHHWgoktzhVEx9XmchNzt1fgZEH52LBgLSfXi',
    original: 'zb2rhfYNbxmFU2iTni5AgTZTX7E8oVVDtvpGpXzbLEX1yYwcq',
    large: 'zb2rhgaY28o8Rtixg2Pdxa8WFPHxMLPtzHNR4s63yvhMU3PKx'
  }
];

export default avatars;

export function getRandomAvatar() {
  const index = Math.floor(Math.random() * avatars.length);
  return avatars[index];
}
