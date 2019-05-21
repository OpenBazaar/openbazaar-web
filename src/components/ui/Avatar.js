import React from 'react';
import { GATEWAY_URL } from 'util/constants';
import { Link } from 'react-router-dom';
import defaultAvatar from '../../img/defaultAvatar.png';
import 'styles/theme.scss';

const sizes = {
  tiny: '24px',
  small: '36px',
  medium: '42px',
  large: '50px',
  original: '60px'
};

const Avatar = props => {
  const fallbackAvatar = `url(${defaultAvatar})`;
  // Using gateway url for now. If we want we could switch to
  // pulling it from js-ipfs later.
  // todo gateway useCache option
  const baseAvatar =
    props.avatarHashes && props.avatarHashes[props.size]
      ? `url("${GATEWAY_URL}images/${
          props.avatarHashes[props.size]
        }?usecache=true")`
      : '';
  const backgroundImage = `${
    baseAvatar ? `${baseAvatar}, ` : ''
  }${fallbackAvatar}`;
  const style = {
    backgroundImage,
    backgroundSize: 'contain',
    color: 'transparent',
    width: props.width || sizes[props.size],
    height: props.height || sizes[props.size],
    borderRadius: '50%',
    borderWidth: '2px',
    borderStyle: 'solid',
    display: 'block',
    userSelect: 'none'
  };
  const className = 'Avatar clrBr2 clrSh1';

  let component = <div className={className} style={style} />;

  if (props.href) {
    component = (
      <Link
        className={className}
        style={style}
        to={props.href}
        onClick={props.onClick}
      >
        User Avatar
      </Link>
    );
  } else if (props.onClick) {
    component = (
      <div
        className={`${className} link`}
        style={style}
        onClick={props.onClick}
      >
        User Avatar
      </div>
    );
  }
  return component;
};
export default Avatar;
