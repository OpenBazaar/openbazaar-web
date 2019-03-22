import React from 'react';
import Spinner from 'components/ui/Spinner';

const GetMnemonicContent = props => {
  let mnemonicContentWrapClass = '';
  let mnemonicContent = null;
  let subcontentClass = '';

  if (props.isFetching) {
    mnemonicContentWrapClass = 'flexCent';
    mnemonicContent = <Spinner size="small" />;
    subcontentClass = 'disabled';
  } else if (props.mnemonic) {
    mnemonicContent = props.mnemonic;
  } else {
    // fetch failed
    mnemonicContent = (
      <span className="clrTErr">
        {'There was an error generating the mnemonic' +
          (props.generateMnemonicError
            ? `: ${props.generateMnemonicError}`
            : '.')}
      </span>
    );
  }

  return (
    <div className="padMd padLeftRight0">
      <div
        className={`border clrBr pad ${mnemonicContentWrapClass}`}
        // match the height of the text area on the prev screen
        style={{
          minHeight: '58px',
          marginBottom: '5px'
        }}
      >
        {mnemonicContent}
      </div>
      <div className={`flexHRight ${subcontentClass}`}>
        <button
          style={{ marginRight: '3px' }}
          className="btn link"
          onClick={props.onRegenerateClick}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
};

export default GetMnemonicContent;

GetMnemonicContent.defaultProps = {
  mnemonic: '',
  generateMnemonicError: ''
};
