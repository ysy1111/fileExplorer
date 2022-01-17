// loop through the children of tbody
const children = $('tbody').children();


//convert children to an array
let children_array =[];

for (let i = 0; i < children.length; i++){
    children_array.push(children[i]);
}

// build an array of object
const items = [];
children_array.forEach(element => {
    const rowDetails = {
        name: element.getAttribute('data-name'),
        size: parseInt(element.getAttribute('data-size')),
        time: parseInt(element.getAttribute('data-time')),
        html: element.outerHTML,
    };
    items.push(rowDetails);
});
//sort status
const sortStatus = {
    name: 'none', // none, up, down
    size: 'none', // none, up, down
    time: 'none', // none, up, down
}

//sort by name
const sort = (items, option, type) => {
    items.sort((item1, item2) => {
        let value1;
        let value2;
        if (type === 'name'){
            value1 = item1.name.toUpperCase();
            value2 = item2.name.toUpperCase();
        }else{
            value1 = item1[type];
            value2 = item2[type];
        }
        if (value1 < value2){
            return -1;
        }
        if (value1 > value2){
            return 1;
        }
        return 0;
        
    });   
    if (option === 'down'){
        items.reverse();
    } 
}


//fill table body with items
const fill_table_body = items => {
    const content = items.map(element => element.html).join('');
    $('tbody').html(content);
}


// event listener
document.getElementById('table_head_row').addEventListener('click', event => {
    if(event.target){
        //clear icons
        $('ion-icon').remove();
        id = event.target.id;
        if (['none','down'].includes(sortStatus[id])){
            //sort in ascending order
            sort(items, 'up', id);
            sortStatus[id] = 'up';
            //add icon
            event.target.innerHTML += ' <ion-icon name="caret-up-circle-outline"></ion-icon>';
        }else if (sortStatus[id] === 'up'){
            sort(items, 'down', id);
            sortStatus[id] = 'down';
            //add icon
            event.target.innerHTML += ' <ion-icon name="caret-down-circle-outline"></ion-icon>';
        }
        fill_table_body(items);
    }
});