import moment from "moment"

export default class Utils {

 static dateTag(date) {
    let yesterday = new Date();
    yesterday = moment(yesterday).subtract(1, 'day').format('YYYY-MM-DD')
    let today = moment(new Date()).format('YYYY-MM-DD');
    let selectedDate = moment(date).format('YYYY-MM-DD')
    if(selectedDate == today){
        return "Today"
    }else if(selectedDate == yesterday){
        return "Yesterday"
    }else{
        return moment(date).format("DD MMMM, YYYY")
    }

}
// Text Capilization
static capitalizeFirstLetter = str => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
    
  static capitalizeEachWord = str => {
      let splitStr = str.toLowerCase().split(" ");
      for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] =
          splitStr[i].charAt(0).toUpperCase() +
          splitStr[i].substring(1).toLowerCase();
      }      
      // Directly return the joined string
      return splitStr.join(" ");
  }
}