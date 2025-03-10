# Pedal Toolbox

## About

_This plugin is built with
[Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/) &
[Tailwind](https://tailwindcss.com/)_

This plugin utilizes the
[JS Intl formatting API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
in the localizer utilities to format date, time and number strings given a set
of locale and style options.

### Features

Pedal Toolbox features a few categories of utilities:

- Generators
  - Device sizes
- Migrators
  - AlertBanner (Web)
  - Alert (Web)
  - Image
- Localizers
  - Currency
  - Date
  - Number
  - Time
- Miscellaneous
  - Linter

### Adding a new utility

All components and views are in the `components` folder. Each view is a modular component, 
meaning any time a new view is added, there are 2 steps to make it accessible within the plugin's navigation:

1. Add it to the "sidebar" navigation menu in `ui.tsx` as a `TabItem`
2. Add a case to the `renderView` function in `ui.tsx` to render the corresponding view

## Getting started

### Pre-requisites

- [Node.js](https://nodejs.org) – v18
- [Figma desktop app](https://figma.com/downloads/)

### Build the plugin

To build the plugin:

```
$ npm run build
```

This will generate a [`manifest.json`](https://figma.com/plugin-docs/manifest/)
file and a `build/` directory containing the JavaScript bundle(s) for the
plugin. To edit the `manifest.json` file, update the corresponding fields in
`package.json`.

To watch for code changes and rebuild the plugin automatically:

```
$ npm run watch
```

### Install the plugin

1. In the Figma desktop app, open a Figma document.
2. Search for and run `Import plugin from manifest…` via the Quick Actions
   search bar.
3. Select the `manifest.json` file that was generated by the `build` script.

### Debugging

Use `console.log` statements to inspect values in the code.

To open the developer console in Figma, go to Plugins > Show/Hide console.

## See also

- [Create Figma Plugin docs](https://yuanqing.github.io/create-figma-plugin/)
- [`yuanqing/figma-plugins`](https://github.com/yuanqing/figma-plugins#readme)
- [Tailwind CSS docs](https://tailwindcss.com/docs/installation)

Official docs and code samples from Figma:

- [Plugin API docs](https://figma.com/plugin-docs/)
- [`figma/plugin-samples`](https://github.com/figma/plugin-samples#readme)
