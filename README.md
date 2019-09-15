# Gmail Desktop

This project provides the Gmail desktop application which supports Linux and Windows.

Features overview: push notifications for all new mails, has a Tray icon, can auto-start minimized to system tray, and more.

This app was built using the [ElectronJS](https://github.com/electron/electron) framework.

#### Disclaimer: This project is an actively-maintained fork of the [Gmail Desktop project](https://github.com/timche/gmail-desktop).

![Gmail Screenshot](src/assets/screenshot.png)

### Motivation behind this fork

Initially set out to make an electron wrapper myself, thanks to FOSS, I found [this brilliant project](https://github.com/timche/gmail-desktop). There are a few things I wished were different about it to make it more suited to my workflow. Implementing those changes may not be feasible for the upstream project. So I forked it, made my changes and am maintaining it for myself.


## Differences from upstream project

The following are whats different about this project compared to the upstream project.

1. Updated app dependencies (including Electron)
2. Implemented support for detecting network connection drops and reconnect, when a connection is re-established, Gmail will refresh itself to avoid missing out on push notifcations (This particular feature is missing from upstream project, I will soon send a PR)
3. Removed support for macOS builds of this app as I do not use a Mac in my workflows
4. More app packages (.deb, .rpm, .pacman, .snap, .AppImage, .exe)
5. Codebase related changes: convert to es6 syntax, removed defunct/dead code, refactored some methods (mostly typing)
6. Removed custom styling code since I prefer the stock UI of Gmail (using custom styles may very rarely cause issues, for instance, when Gmail change their stylesheets and co)
7. Removed travis CI pipelines since this repo doesn't have integration hooks setup yet (will soon be re-added)
8. Added an About App window with some decorations to view app info (version, links, etc.)
9. The menu bar is hidden by default and can be made visible by hitting the `Alt` key.
10. Removed ability to inject custom CSS (this, along with no custom styling, will prevent customization but not all people want it).

# Features

- Stock Gmail UI
- Works on both Windows, and Linux (with dedicated packages for most distros).
- Native push notifications for new email. 
- Unread mails indicator (Colored icon for unread / Greyish icon for inbox 0) in Windows/Linux tray.
- Useful keyboard shortcuts and nifty Tray icon indicator.
- Start minimized to Tray.
- Network detection - refresh and keep alive when network goes down, and comes back up.
- Always up-to-date app dependencies.
- Automatic updates.

# Download

## Linux

For distros using APT (Debian and Ubuntu +/ derivatives): get the `.deb` package from [releases page](https://github.com/cyfrost/gmail-electron/releases/latest).

For DNF based distros (Fedora, RHEL, CentOS, SuSE): get the `.rpm` package from [releases page](https://github.com/cyfrost/gmail-electron/releases/latest).

For Arch and derivatives: get the `.pacman` package from [releases page](https://github.com/cyfrost/gmail-electron/releases/latest).

`.AppImage` or `.snap` for everyone else.

## Windows

For Windows 7 and above, get the latest `.exe` file from [releases page](https://github.com/cyfrost/gmail-electron/releases/latest) and install it normally by opening it.


# Build Instructions

The build process is very simple:

1. Clone the repo using `$ git clone https://github.com/cyfrost/gmail-electron`.

2. Install project dependencies by running `$ make env` in project root directory (NodeJS is a prerequisite).

3.  To start the app (and debug any changes), you can do `$ make run` in the project root directory (or `$ npm run start`).

4. (Optional) To update the app dependencies, do `$ make update`.

## Building Distribution Packages

After making your changes, you can simply use any of the below commands to build 64-bit distribution packages.

1. Run `$ make build-rpm` to build `.rpm` packages (for Fedora/CentOS/RHEL/SuSE).
2. Run `$ make build-deb` to build `.deb` packages (for Debian/Ubuntu and derivatives).
3. Run `$ make build-pacman` to build `.pacman` packages (for Arch/Manjaro and derivatives).
4. Run `$ make build-appimage` to build `.AppImage` package (for almost every distro out there).
5. Run `$ make build-win` to build Windows `.exe` files.
6. Run `$ make build-linux` to build both `.DEB` and `.RPM` packages.
7. Run `$ make build-all` to build packages for both Windows and Linux (basically all the above).

## Contributing

No rules for contributing, Just send a PR :)

## Maintainer

- [Cyrus Frost](https://github.com/cyfrost)

The original authors of this project are different, see [here](https://github.com/timche/gmail-desktop) for more info.

## License

MIT license. Copyright © 2019 Tim Cheung

## Disclaimer

Gmail Electron (provided by this project) is a community-built open-source app that relies on open-source technologies and is in no way affiliated with or endorsed by Google.
