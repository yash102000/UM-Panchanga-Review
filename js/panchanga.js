class Panchanga_Database {
    constructor(
        language,
        date, month, year,
        samvatsara, ayana, rutu, masa, masaNiyamaka,
        paksha, thithi, calendarmark, vasara,
        nakshatra, yoga, karana,
        sunrise, sunset, shradhatithi, vishesha
    ) {
        this.language = language;

        this.date = date;
        this.month = month;
        this.year = year;

        this.samvatsara = samvatsara;
        this.ayana = ayana;
        this.rutu = rutu;
        this.masa = masa;
        this.masaNiyamaka = masaNiyamaka;
        this.paksha = paksha;
        this.thithi = thithi;
        this.calendarmark = calendarmark;
        this.vasara = vasara;
        this.nakshatra = nakshatra;
        this.yoga = yoga;
        this.karana = karana;
        this.sunrise = sunrise;
        this.sunset = sunset;
        this.shradhatithi = shradhatithi;
        this.vishesha = vishesha;
    }
}