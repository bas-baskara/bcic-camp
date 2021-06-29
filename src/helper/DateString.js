function dDate(date) {
    return date.getDate() < 10 ? '0' + date.getDate():date.getDate().toString()
}

const monthString = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

    
const DateString = (function(date) {        
    return dDate(date) + ' ' + monthString[date.getMonth()] + ' ' + date.getFullYear()
})

export default DateString