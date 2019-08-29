# Gmail Electron

This project provides the Gmail web app as a native desktop application.

It supports push notifications for all new mails, has a Tray icon, can start minimized to tray, and much more.

Supported platforms are: most Linux distros and most Windows versions.

This app was built using [Electron](https://github.com/electron/electron) framework.

### Disclaimer: This project is an actively-maintained fork of the [Gmail Desktop project](https://github.com/timche/gmail-desktop).


## Motivation for this fork

I'd initially planned to build Gmail electron from scratch, but thanks to Open Source and contributors from around the world, I found [this brilliant project](https://github.com/timche/gmail-desktop) that already did *everything* I'd wanted. I didn't like a few things and wanted to change them, hence the fork and no PR.

![Gmail Screenshot](src/assets/screenshot.png)

## Differences between this project and upstream

### 1. Always up-to-date app dependencies (including Electron)
For better or for worse, I always tend to keep the app dependencies up-to-date. For people that say "too new software could break stuff", I like placing emphasis on building software that isn't so *easily* broken because the dependent libs are updated.

### 2. Dropped all support (code and builds) for macOS
As said, this fork is heavily customized to my liking; Since I do not use a Mac in any of my workflows (yet), removing the code and traces related to darwin only paves for better maintenance.

### 3. More native packages for more distros
This project provides app packages for distros that use either of `.deb`, `.rpm`, `.pacman`, `.snap`, and `.AppImage`. Windows is also supported via the NSIS installer package `.exe`.

### 4. Codebase and development consistencies/inconsistencies
The codebase was *fully* converted to ES6 (this didn't come without few build errors ;)). All the code that I don't deem useful for my use-case (darwin-related traces, custom styling code, AppMenu components that weren't feature complete, and more) has been removed. lots of refactoring and cleanup as well. A Makefile was added as a bootstrap to quickly get started with development and builds (so you could simply do `git clone` and run `make env`, `make run`, and `make build-all` as a one-shot workflow). Unfortunately, I had to remove the travis CI integration that upstream had, this will soon be re-added.

### 5. Handles network change-detection
When the network goes down, and comes back up, you'll notice the upstream app won't reconnect to Gmail servers. This fork includes handling code for that, on connection back online, the window will refresh.

### 6. Minor features: Start Minimized in Tray, and an About window.
Support for Starting Minmized to Tray was added recently, and also a handy About window acccessible via the Tray context menu that lists out some information about the app including project links, and debug info..

#### A big open-source hug to upstream for this app, that has allowed me to customize it to my liking, and I'll keep maintaining this fork by including fixes and improvements from upstream, updating dependencies and more.

PS: the reason this fork isn't a pull-request is, there are way too many changes that *won't* necessarily be accepted upstream. This doesn't have to be a PR because it's not meant to be. What this is, is, just a fork thats tasted to my liking, you can do your own too :)

# Features

- Stock and untouched Gmail UI/UX
- Works on both Windows, and Linux (with dedicated packages for most distros).
- Native push notifications for new email. 
- Unread mails indicator (Colored icon for unread / Greyish icon for inbox 0) in Windows/Linux tray.
- Useful keyboard shortcuts and nifty Tray icon indicator.
- Start minimized to Tray.
- Network detection - refresh and keep alive when network goes down, and comes back up.
- Always up-to-date app dependencies.

# Download

## Linux

For distros using APT (Debian and Ubuntu +/ derivatives): get the `.deb` package from [releases page](https://github.com/cyfrost/gmail-electron/releases/latest).

For DNF based distros (Fedora, RHEL, CentOS, SuSE): get the `.rpm` package from [releases page](https://github.com/cyfrost/gmail-electron/releases/latest).

For Arch and derivatives: get the `.pacman` package from [releases page](https://github.com/cyfrost/gmail-electron/releases/latest).

`.AppImage` for everyone else.

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

The original authors of the upstream project are different, see [here](https://github.com/timche/gmail-desktop) for more info.

## License

MIT license. Copyright © 2019 Tim Cheung

## Disclaimer

Gmail Electron (provided by this project) is a community-built open-source app that relies on open-source technologies and is in no way affiliated with or endorsed by Google.
