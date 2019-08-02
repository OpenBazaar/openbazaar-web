export function generatePbTimestamp(timestamp = new Date()) {
  if (!(timestamp instanceof Date)) {
    throw new Error(
      'If providing a timestamp, it must be provided as a Date instance.'
    );
  }

  return {
    seconds: Math.floor(timestamp / 1000),
    nanos: timestamp % 1000
  };
}
