# Archived: The results of this work can be found in https://github.com/holochain/holochain-rust/tree/develop/hc_cluster_test

## emulation-testing

Check out the results of different emulation tests on the CI:
https://circleci.com/gh/holochain/emulation-testing

Make sure you run `npm install`

This code should be compatible as of now with the `develop` branch of [holochain-rust](https://github.com/holochain/holochain-rust).

The following environment variable needs to be set before running this,
to specify which binary to execute the DNA with.
```
EMULATION_HOLOCHAIN_BIN_PATH=/Path/to/holochain/binary
```

Then, run `node index.js`, or `npm test`

Optionally, you can give it an argument, with the number of Conductors to start, like:
(default is 2)
```
node index.js 4
```

Optionally, you can give it a second argument, selecting whether to show debug logs, like:
(default is false)
```
node index.js 4 true
```

See some example emulation logs. P.s. I don't recommend running with 10 nodes on 1 device, unless it is has 32 or 64 GB of RAM and oodles of cores.
https://gist.github.com/Connoropolous/5b6b61922370fe378a1e7473918406cc
