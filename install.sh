#!/bin/sh
curl -L https://github.com/trueinteractions/tint-chromium/releases/download/0.0.1/chromiumlib.framework.0.0.1.zip > chromiumlib.framework.zip
unzip chromiumlib.framework.zip
rm -rf chromiumlib.framework.zip
