// before a profile is save
// -- ensure it is saved with a needIpfsAdd of true

// ^^^ needIpfsAdd should be in seperate table.

// anytime the profile changes
// -- add it to ipfs
// ---- upon complete
// ------ fire action IPFS_ADDED
// ---- upon fail, log error

// anytime a listing changes
// fire IPFS_ADD_LISTING

// takeEvery IPFS_ADD_LISTING
// -- add it to ipfs
// ---- upon complete
// ------ update the listing index
// ------ add it to ipfs
// -------- upon complete
// ---------- fire action IPFS_ADDED
// -------- upon fail, log error
// ---- upon fail, log error

// takeLatest IPFS_ADDED
// -- toggle needIpfsAdd flag
// -- toggle global needsPublish flag
// -- fire PUBLISH ACTION

// takeLatest PUBLISH
// -- fire PUBLISHING action
// ---- republish root
// ---- fire PUBLISH_SUCCESS, PUBLISH_FAIL action
// ------ on PUBLISH_SUCCESS

// on startup
// -- look through needIpfsAdd records
// ---- ones that need it fire respective IPFS_ADD_* action