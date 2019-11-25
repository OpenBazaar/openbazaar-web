export function getName(profile) {
  if (typeof profile !== 'object') {
    throw new Error('Please provide a profile object.');
  }

  return (
    (profile.handle && `@${profile.handle}`) || profile.name || profile.peerID
  );
}
