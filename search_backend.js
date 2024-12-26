const userinput = prompt("What is the ISBN of the book you're looking for?: ");
const apiUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`;

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    const book = data[`ISBN:${userinput}`];
    console.log(book.title);
    console.log(book.authors);
    console.log(book.publish_date);
  })
  .catch(error => console.log(error));
