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

* Added rudimentary support for handling network reset events; Gmail will refresh itself when there's a network change to avoid missing out on push notifications (Test/repro scenario: wake from S3 and you should see Gmail refreshing itself).
* Dropped all (code + builds) related to macOS since I do not use a Mac in any of my workflows.
* Reverted all custom styles made by upstream; no css will be changed at all.
* Removed ability to inject custom CSS (this + above change are done to prevent any rare issues that stem from modifying 3rd party stylesheets. For instance, when gmail changes their css vars and co.; This sacrifices customization but I can live without it :)).
* Removed travis CI pipelines since this repo doesn't have integration hooks setup yet (will soon be re-added).
* \[meh\] Added a decorated About App page accessible via Tray icon > About.
* The menu bar is hidden by default and can be made visible by hitting the `Alt` key, this is ephemeral and not preserved.
* Supports "Start as Minimized" feature (can be triggered in autostart via `gmail --start-minimized`)

# Features

Mostly the same features as upstream app (excepting those related to macOS and custom styling), plus:

* \[minor/meh\] Start as minimzed (nice to have it though)
* Supports refreshing self on network changes to avoid missing push notifications
* \[minor/meh\] a fancy-yet-almost-useless About page

# Download

## GNU/Linux

For APT based distros (Debian/+ derivatives): get the `.deb` package from [here](https://github.com/cyfrost/gmail-electron/releases/latest).

For DNF based distros (Fedora, RHEL, CentOS, SuSE): get the `.rpm` package from [here](https://github.com/cyfrost/gmail-electron/releases/latest).

For Arch and derivatives: get the `.pacman` package from [here](https://github.com/cyfrost/gmail-electron/releases/latest).

`.AppImage` or `.snap` for everyone else.

## Windows

For Windows 7 and above, get the latest `.exe` file from [here](https://github.com/cyfrost/gmail-electron/releases/latest) and install it normally by running it. There are no configurable options in the installer.

# Build Instructions

The build process is very simple:

1. Clone the repo using `$ git clone https://github.com/cyfrost/gmail-electron`.

2. Install project dependencies by running `$ make env` in project root directory (NodeJS is a prerequisite).

3. To start the app (and debug any changes), do `$ make run` in the project root directory (or `$ npm run start`).

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

I maintain this fork for just myself, but all credits to @timche and @markpython for making the upstream app so useful. Read more about them [here](https://github.com/timche/gmail-desktop#maintainers).

## License

[Inherited from upstream](https://github.com/timche/gmail-desktop/blob/master/LICENSE), no changes.

## Disclaimer

The Gmail app provided by this "forked" project is a community-built open-source app that relies on open-source technologies for its functionalities and is in no way affiliated with or endorsed by Google.
