function getStartAndEnd(molad, numDaysFromMolad, daysUntilEnd){
    //TODO: have to figure out how to do partial days, this is me'eis l'eis...
    var start = new Date(molad.getTime() + (numDaysFromMolad*24*60*60*1000));
    var end = new Date(molad.getTime() + (daysUntilEnd*24*60*60*1000));
    return [start, end];
}

export { getStartAndEnd };