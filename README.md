# VideoJS Flash Captions Plugin

This plugin takes the `onTextData` event triggered from the flash object an displays them as closed captions on a VideoJS player.

## Usage

Inlude the plugin and its stylesheet:

```
<script src="http://vjs.zencdn.net/5.0.2/video.js"></script>
<script src="videojs-flash-captions.js"></script>
<link rel="stylesheet" type="text/css" href="videojs-flash-captions.css">
```

Then simply activate the plugin on your video by calling its function:

```
myvideo.FlashClosedCaptions({});
```

## Options

The options object passed into the plugin function can contain the following:

- numRows: Number of rows of text to display (default: 2)
- numLinesPerRow: This is the number of text lines received to display on one row of text (default: 2)
- enableCookies: This enables cookie support for auto-displaying captions for the next video when activated (default: true)
