function getRegionalData (dataToFilter, region) {
  var readings = dataToFilter.filter(function (reading) {
    return reading.region === region
  })

  return readings
}

function calculatePSI (dataset) {
  var currentReading = dataset[-1].concentration
  var uppPSIbreakpoint, lowPSIbreakpoint, uppPMbreakpoint, lowPMbreakpoint

  switch (true) {
    case currentReading <= 12:
      lowPSIbreakpoint = 0, uppPSIbreakpoint = 50, lowPMbreakpoint = 0, uppPMbreakpoint = 12
      console.log(lowPSIbreakpoint, uppPSIbreakpoint, lowPMbreakpoint, uppPMbreakpoint);
      break
    case currentReading <= 55:
      lowPSIbreakpoint = 50, uppPSIbreakpoint = 100, lowPMbreakpoint = 12, uppPMbreakpoint = 55
      console.log(lowPSIbreakpoint, uppPSIbreakpoint, lowPMbreakpoint, uppPMbreakpoint);
      break
    case currentReading <= 150:
      lowPSIbreakpoint = 100, uppPSIbreakpoint = 200, lowPMbreakpoint = 55, uppPMbreakpoint = 150
      console.log(lowPSIbreakpoint, uppPSIbreakpoint, lowPMbreakpoint, uppPMbreakpoint);
      break
    case currentReading <= 250:
      lowPSIbreakpoint = 200, uppPSIbreakpoint = 300, lowPMbreakpoint = 150, uppPMbreakpoint = 250
      console.log(lowPSIbreakpoint, uppPSIbreakpoint, lowPMbreakpoint, uppPMbreakpoint);
      break
    case currentReading <= 350:
      lowPSIbreakpoint = 300, uppPSIbreakpoint = 400, lowPMbreakpoint = 250, uppPMbreakpoint = 350
      console.log(lowPSIbreakpoint, uppPSIbreakpoint, lowPMbreakpoint, uppPMbreakpoint);
      break
    case currentReading <= 500:
      lowPSIbreakpoint = 400, uppPSIbreakpoint = 500, lowPMbreakpoint = 350, uppPMbreakpoint = 500
      console.log(lowPSIbreakpoint, uppPSIbreakpoint, lowPMbreakpoint, uppPMbreakpoint);
      break
  }

  var currentOneHrPSI = (uppPSIbreakpoint - lowPSIbreakpoint) / (uppPMbreakpoint - lowPMbreakpoint) * (currentReading - lowPMbreakpoint) + lowPSIbreakpoint

  return Math.ceil(currentOneHrPSI)
}
