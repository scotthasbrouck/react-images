import React from 'react';
import ReactDOM from 'react-dom';
import loadImage from './loadimage.js';

class ExifImage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.willRotate = [
      'right-top',
      'left-top',
      'left-bottom',
      'right-bottom'
    ];

    this.rotationStyleMap = {
      'right-top': {
        transform: 'rotate(0.25turn)',
      },

      'left-top': {
        transform: 'rotate(0.25turn) scaleY(-1)',
      },

      'top-right': {
        transform: 'scaleX(-1)',
      },

      'top-left': {},

      'bottom-right': {
        transform: 'rotate(0.5turn)',
      },

      'bottom-left': {
        transform: 'rotate(0.5turn) scaleX(-1)',
      },

      'left-bottom': {
        transform: 'rotate(-0.25turn)',
      },

      'right-bottom': {
        transform: 'rotate(-0.25turn) scaleX(-1)',
      }
    };

    this.state = {
      imgStyle: {},
      containerStyle: {}
    };
  }

  static propTypes = {
    urlValue: React.PropTypes.string,
  }

  fetchImage(imageUrl){
    let xhr = new XMLHttpRequest();
    xhr.open( 'GET', imageUrl, true );
    xhr.responseType = 'arraybuffer';
    const imagePromise = new Promise((resolve, reject) => {
      xhr.onload = function(e) {
        resolve({
          response: this.response,
          contentType: this.getResponseHeader('content-type')
        });
      };

      xhr.onerror = function(e) {
        reject(e);
      };
    });
    xhr.send();
    return imagePromise;
  }

  processImageBuffer({response, contentType}) {
    const self = this;
    loadImage.parseMetaData(new Blob([response], {type: contentType}),
      (data) => {
        const orientation = data.exif.getAll().Orientation;
        const imgStyle = this.rotationStyleMap[orientation];
        const newState = {
          imgStyle: imgStyle
        };
        if(self.willRotate.indexOf(orientation) > -1) {
          const containerTag = ReactDOM.findDOMNode(self.refs.container);
          const containerStyle = Object.assign({}, self.state.containerStyle, {
              width: containerTag.offsetHeight
          });
          newState.containerStyle = containerStyle;
        }
        self.setState(newState);
        });
  }

  handleUrlUpdate(url){
    return this
      .fetchImage(url)
      .then(this.processImageBuffer.bind(this))
      .catch((e) => {
        console.error(e);
      });
  }

  componentDidMount(){
    this.handleUrlUpdate.bind(this)(this.props.urlValue);
  }

  componentDidUpdate(prevProps){
    if(prevProps.urlValue !== this.props.urlValue){
      this.handleUrlUpdate.bind(this)(this.props.urlValue);
    }
  }

  render() {
    return (
      <div
        className="wi-ExifImage-Container"
        ref="container"
        style={this.state.containerStyle}>
        <img
          {...this.props}
          style={this.state.imgStyle}
          ref="img"
          src={this.props.urlValue}/>
      </div>
    );
  }

}

export default ExifImage;
