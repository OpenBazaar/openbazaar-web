import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CategoryBox from 'components/listings/CategoryBox';
import './Discovery.scss';

const cards = [
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball2",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball3",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball4",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball5",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball6",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball7",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball8",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
  {
    vendorId: 'QmZWq7dECr6icXBkxpjKR2PPFGSPCAGCxerdJdZnLBWnc3',
    score: 2,
    hash: "",
    slug: "teapot-flower-ball9",
    title: "*Flower Ball Teapot",
    tags: [
      "hand-painted",
      "handmade",
      "gold",
      "vintage",
      "souvenir",
      "porcelain",
      "chinaware",
      "tableware",
      "dishware",
      "teapot"
    ],
    categories: [
      "decorated with gold",
      "teapot",
      "hand painting"
    ],
    contractType: "PHYSICAL_GOOD",
    description: "<p><strong>AVAILABLE </strong>for order.<br></p><p>Its a prickly little feller</p><p>Weight: 2 kg (4 lb)</p>",
    thumbnail: {
      tiny: "zb2rhdD7hnyp5vt8mqEazdCmdJVNSmQHkHzMcDUA5x1GdqJWh",
      small: "zb2rhh47kKecSQtpigopSdEJRPrCLX4dUCvnjyEWDMYHFkRK1",
      medium: "zb2rhiJT9SERe3rfEgfE7Kk4LiHLYg7p6txLw94E7yebsuvdp",
      original: "zb2rhWiLzC7KncCdxHy3nsDVkaFykw15nbSL2AAH2zgtzrAAA",
      large: "zb2rhjeQ6qcfHhaHhrEKWU2n6urPTWSSNQ8LEX69XCqPxB32Q"
    },
    language: "",
    price: {
      currencyCode: "USD",
      amount: 30000,
      modifier: 0
    },
    nsfw: false,
    averageRating: 0,
    ratingCount: 0,
    shipsTo: [
      "ALL"
    ],
    acceptedCurrencies: [
      "BTC"
    ],
    coinType: "",
    coinDivisibility: 0,
    normalizedPrice: 0.08695576560203824
  },
];

class Discovery extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div className="Discovery pageWidth pagePadTopBottom">
        <CategoryBox cards={cards} heading='Simple Pleasures' />
      </div>
    );
  }
}

function mapStateToProps(state, prop) {
  return {
    // modals: state.modals,
    // router: state.router
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // actions: {
    //   modals: bindActionCreators(ModalActions, dispatch)
    // }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Discovery);
