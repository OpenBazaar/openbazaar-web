import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Tooltip from 'components/ui/Tooltip';

/*
 * This component will wrap the trigger component you provide so when the
 * showCopiedText prop is set to true a "copied" tooltip will appear beneath it.
 */
export default class extends Component {
  static defaultProps = {
    copiedText: 'Copied',
    copyContent: ''
  };

  static propTypes = {
    copiedText: PropTypes.string,
    copyContent: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      showCopiedText: false
    };

    this.handleTriggerClick = this.handleTriggerClick.bind(this);
  }

  componentWillUnmount() {
    clearTimeout(this.copiedTextTimeout);
  }

  handleTriggerClick() {
    clearTimeout(this.copiedTextTimeout);
    this.setState({ showCopiedText: true });

    this.copiedTextTimeout = setTimeout(() => {
      this.setState({ showCopiedText: false });
    }, 2000);
  }

  render() {
    return (
      <Tooltip
        title={this.props.copiedComponent ? '' : this.props.copiedText}
        html={this.props.copiedComponent}
        open={this.state.showCopiedText}
        {...this.props}
      >
        <CopyToClipboard
          text={this.props.copyContent}
          onCopy={this.handleTriggerClick}
        >
          {this.props.children}
        </CopyToClipboard>
      </Tooltip>
    );
  }
}
