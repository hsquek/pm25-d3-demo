function getRegionalData (dataToFilter, region) {
  var readings = dataToFilter.filter(function (reading) {
    return reading.region === region
  })

  return readings
}
