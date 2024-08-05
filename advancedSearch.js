const searchForms = document.querySelectorAll('form');

searchForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const searchTerms = {};
    let i;
    for (i = 0; i < formData.entries().length; i++) {
      const [key, value] = formData.entries()[i];
      const column = key;
      const searchValues = value.split(',').map((term) => {
        if (term.startsWith('-')) {
          console.log(column);
          return { field: column, operator: 'endswith', value: term.slice(1) };
        }
        if (term.endsWith('-')) {
          return {
            field: column,
            operator: 'startswith',
            value: term.slice(0, -1),
          };
        }
        return { field: column, operator: 'contains', value: term };
      });
      searchTerms[column] = searchValues;
    }

    // Construct the searchArg object based on searchTerms
    const searchArg = {
      descendants: Object.entries(searchTerms).flatMap(
        ([column, values]) => values
      ),
    };

    // Send the searchArg to the server for processing
    // ...
  });
});
