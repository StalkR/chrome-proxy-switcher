#!/bin/bash
rm -f extension.zip
zip extension.zip manifest.json options.{html,css,js} popup.{html,css,js} settings.js icon{16,24{,-grey},32,128}.png
chmod a+r extension.zip
