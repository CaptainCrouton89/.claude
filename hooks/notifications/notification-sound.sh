#!/bin/bash

# Play a more attention-grabbing sound when Claude needs attention/permission
afplay /System/Library/Sounds/Tink.aiff -v 8 &
sleep 0.03
afplay /System/Library/Sounds/Tink.aiff -v 5 &
sleep 0.07
afplay /System/Library/Sounds/Tink.aiff -v 3 &
sleep 0.08
afplay /System/Library/Sounds/Tink.aiff -v 8 &