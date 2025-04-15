import * as theme from '../dist/index.js';

Object.entries(theme.vars).forEach(([key, value]) => {
    console.log(key, value)
})