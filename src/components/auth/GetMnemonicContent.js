import React from 'react';
import Spinner from 'components/ui/Spinner';

const GetMnemonicContent = props => {
  let mnemonicContent = null;
  let refreshLinkText = '';

  if (props.isFetching) {
    mnemonicContent = (
      <div class="flexCent">
        <Spinner size="small" />
      </div>
    );
  } else if (props.mnemonic) {
    mnemonicContent = props.mnemonic;
    refreshLinkText = 'Refresh';
  } else {
    // fetch failed
    mnemonicContent =
      'There was an error generating the mnemonic' +
      props.generateMnemonicError ?
        `: ${props.generateMnemonicError}` : '.';
    refreshLinkText = 'Retry';
  }

  return (
    <div className="padMd padLeftRight0">
      <div
        className="border clrBr pad"
        // match the height of the text area on the prev screen
        style={{
          minHeight: '54px',
          marginBottom: '5px',
        }}>
        {mnemonicContent}
      </div>
      <div className="flexHRight">
        <button
          style={{marginRight: '3px'}}
          className="btn link"
          onClick={props.onRefreshClick}>{refreshLinkText}</button>
      </div>
    </div>
  );
}

export default GetMnemonicContent;

GetMnemonicContent.defaultProps = {
  mnemonic: '',
  generateMnemonicError: '',
};