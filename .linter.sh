#!/bin/bash
cd /home/kavia/workspace/code-generation/hideseek-online-34847-cd6a78e8/hide_seek_online
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

