#!/usr/bin/env node
import {processArgs} from './ifctool.js'


process.exitCode = await processArgs(process.argv.slice(2))
