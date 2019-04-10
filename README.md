# Disclaimer

## I'm currently not working on it so it probably doesn't work 😔

Check out 

- [VSCode MDX Preview](https://github.com/xyc/vscode-mdx-preview)
- [VSCode Browser Preview](https://t.co/z5vTIYZU7R)


# Current Module Preview

Run Parcel dev server on current file and execute side effects inside HTML document.

![](./animation.gif)

## Features

- Render current file

The main goal of this extension is to replicate **Current Module View** feature from CodeSandbox inside of VSCode.

## Usage

Run `Preview Current Module 📃👀` command in a file that writes to the DOM.

We're using Parcel to allow importing JavaScript, TypeScript, Reason and all of the stuff Parcel just gets with no config.

## Roadmap

- [] Improve React experience -- ReactDOM.render default export if `currentModulePreview.mode: "react"` is set

<!-- > Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

<!-- ## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: enable/disable this extension
- `myExtension.thing`: set to `blah` to do something -->


<!-- ## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z. -->
