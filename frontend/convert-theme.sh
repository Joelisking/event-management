#!/bin/bash

# PFW Theme Conversion Script
# Converts dark mode colors to light mode with PFW gold theme

# Color mappings:
# Dark backgrounds -> Light backgrounds
# Blue accents -> Gold accents
# Light text -> Dark text

find components -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' \
  -e 's/bg-slate-950\/[0-9]*/bg-white/g' \
  -e 's/bg-slate-950/bg-white/g' \
  -e 's/bg-slate-900\/[0-9]*/bg-gray-50/g' \
  -e 's/bg-slate-900/bg-gray-50/g' \
  -e 's/bg-slate-800\/[0-9]*/bg-gray-100/g' \
  -e 's/bg-slate-800/bg-gray-100/g' \
  -e 's/border-slate-800\/[0-9]*/border-gray-200/g' \
  -e 's/border-slate-800/border-gray-200/g' \
  -e 's/border-slate-700/border-gray-300/g' \
  -e 's/bg-blue-600/bg-pfw-gold/g' \
  -e 's/bg-blue-500/bg-gold-dark/g' \
  -e 's/hover:bg-blue-600/hover:bg-pfw-gold/g' \
  -e 's/hover:bg-blue-500/hover:bg-gold-dark/g' \
  -e 's/text-slate-300/text-gray-700/g' \
  -e 's/text-slate-100/text-gray-900/g' \
  -e 's/text-slate-50/text-black/g' \
  -e 's/text-slate-400/text-gray-600/g' \
  -e 's/text-blue-400/text-pfw-gold/g' \
  -e 's/text-blue-300/text-pfw-gold/g' \
  -e 's/shadow-blue-900\/[0-9]*/shadow-pfw-gold\/10/g' \
  -e 's/shadow-blue-500\/[0-9]*/shadow-pfw-gold\/20/g' \
  -e 's/ring-blue-500\/[0-9]*/ring-pfw-gold\/20/g' \
  -e 's/border-blue-500\/[0-9]*/border-pfw-gold\/30/g' \
  -e 's/focus:border-blue-500/focus:border-pfw-gold/g' \
  -e 's/focus:ring-blue-500/focus:ring-pfw-gold/g' \
  -e 's/placeholder:text-slate-500/placeholder:text-gray-400/g' \
  -e 's/hover:bg-slate-800/hover:bg-gray-100/g' \
  -e 's/hover:text-slate-100/hover:text-black/g' \
  -e 's/hover:border-slate-600/hover:border-gray-400/g' \
  -e 's/hover:text-blue-400/hover:text-pfw-gold/g' \
  {} +

echo "Theme conversion complete!"
