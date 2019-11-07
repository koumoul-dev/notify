require('./app').start().then(() => {}, err => {
  console.error('Failure', err)
  process.exit(-1)
})

process.on('SIGTERM', function onSigterm () {
  console.info('Received SIGTERM signal, shutdown gracefully...')
  require('./app').stop().then(() => {
    console.log('shutting down now')
    process.exit()
  }, err => {
    console.error('Failure while stopping', err)
    process.exit(-1)
  })
})
