let primaryDataList;
let displayedDataList;
let allData;
let iterator = 0;

const list = document.getElementById('list');
const searchInput = document.getElementById('search');
const sortByDateInput = document.getElementById('FilterSelect');
const sortByDateButton = document.getElementById('sortByDate');
const sortByTagInput = document.getElementById('tagsSearch');
const sortByTagButton = document.getElementById('sortByTag');
const buttonReset = document.getElementById('reset');


//adding filtered nodes to page
function addFilteredData(key) {
    debugger;
    displayedDataList = primaryDataList.filter(function (post) {
        console.log(key);
        return post.title.includes(key);
    });

    removeList();
    if (displayedDataList.length >= 10) {
        addData(displayedDataList, 10);
    } else {
        addData(displayedDataList, displayedDataList.length)
    }
}

//Remove all Nodes
function removeList() {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

//Delete post from Node and local Data
function deletePost() {
    debugger;

    let deletedPost = this.parentNode.parentNode.parentNode;
    let id = deletedPost.id;


    //remove from array
    primaryDataList = primaryDataList.filter((data) => {
        return (parseInt(id) !== data.id);
    });

    displayedDataList = displayedDataList.filter((data) => {
        return (parseInt(id) !== data.id);
    });

    //remove from node
    list.removeChild(deletedPost);

}

//Function that help sorting by date
function sortByDate() {

    //clear tag input
    sortByTagInput.value = "";

    let value = sortByDateInput.value;

    //Writing info to local storage
    window.localStorage.setItem('typeOfSorting', 'date');
    window.localStorage.setItem('typeOfDateSorting', value);


    switch (value) {
        case "decrease":
            primaryDataList.sort((a, b) => b.milliseconds - a.milliseconds);
            displayedDataList.sort((a, b) => b.milliseconds - a.milliseconds);
            break;
        case "increase":
            primaryDataList.sort((a, b) => a.milliseconds - b.milliseconds);
            displayedDataList.sort((a, b) => a.milliseconds - b.milliseconds);
    }

    removeList();
    iterator = 0;
    if (displayedDataList.length >= 10) {
        addData(displayedDataList, 10);
    } else {
        addData(displayedDataList, displayedDataList.length)
    }
}

//function that helps sorting by tag(s)
function sortByTag() {
    debugger;
    searchInput.value = "";

    let tags = sortByTagInput.value.split(" ");

    //Writing info to local storage
    window.localStorage.setItem('typeOfSorting', 'tags');
    window.localStorage.setItem('tagsForSorting', tags);


    displayedDataList = primaryDataList.sort((a, b) => {
        let countOfTagsA = 0;
        let countOfTagsB = 0;

        tags.forEach((tag) => {
            a.tags.includes(capitalize(tag.toLowerCase())) ? countOfTagsA++ : {};
            b.tags.includes(capitalize(tag.toLowerCase())) ? countOfTagsB++ : {};
        });

        if (countOfTagsB - countOfTagsA === 0) {
            let value = sortByDate.value;
            switch (value) {
                case "decrease":
                    return b.milliseconds - a.milliseconds;
                case "increase":
                    return a.milliseconds - b.milliseconds;
                default:
                    return b.milliseconds - a.milliseconds;
            }
        }

        return countOfTagsB - countOfTagsA;
    });

    debugger;

    removeList();
    iterator = 0;
    if (displayedDataList.length >= 10) {
        addData(displayedDataList, 10);
    } else {
        addData(displayedDataList, displayedDataList.length)
    }
}

//helping function that helps capitalizing tags
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//function for reset button
function reset() {
    removeList();

    //set display to 'none'
    buttonReset.className = "no-display";
    iterator = 0;

    //scroll to top
    window.scrollTo(0, 0);
    addData(displayedDataList, 10)
}

//Adding nodes to page
function addData(dataList, count) {
    debugger;

    for (let i = iterator * 10; i < iterator * 10 + count; i++) {
        let title = dataList[i].title;
        let description = dataList[i].description;
        let imgUrl = dataList[i].image;
        let date = dataList[i].createdAt;
        let id = dataList[i].id;
        let tags = dataList[i].tags;
        let deleteButton;

        let div = document.createElement('div');
        div.id = id;

        let card = `
                        <div class="card">
                            <img src="${imgUrl}" class="card-media"/>
                            <div class="card-details">
                                <h2 class="card-head">${title}</h2>
                                <p>${description}</p>
                                <div class="info">
                                    <span>${date}</span>
                                    <span>
                                        <span><strong>Tags:</strong> ${tags}</span>
                                    </span>
                                </div>
                                <a href="#/" class="card-action-button button-delete">DELETE</a>
                            </div>
                        </div>
                    `;

        div.innerHTML = card;
        deleteButton = div.getElementsByClassName('button-delete')[0];
        deleteButton.addEventListener('click', deletePost);

        list.appendChild(div);
    }

    iterator++;
}


window.onload = () => {

    //Fetch data from json
    fetch('https://api.myjson.com/bins/152f9j')
        .then(response => {
            debugger;
            response.json().then(data => {
                return data.data;
            }).then(dataList => {

                    //Add indexes to use in Nodes tree
                    dataList.forEach((data, index) => {

                        //Also we can use id that can be genered by database or etc
                        data.id = index;

                        //Adding milliseconds of time to use in filter
                        data.milliseconds = Date.parse(data.createdAt);
                    });

                    displayedDataList = primaryDataList = allData = dataList;

                    //Checking default sorting
                    if (!localStorage.getItem("typeOfSorting")) {
                        dataList.sort((a, b) => b.milliseconds - a.milliseconds);
                        addData(displayedDataList, 10);
                    } else {
                        switch (localStorage.getItem("typeOfSorting")) {
                            case "date":
                                let value = localStorage.getItem("typeOfDateSorting");
                                sortByDateInput.value = value;
                                sortByDate();
                                break;

                            case "tags":
                                let tags = localStorage.getItem("tagsForSorting").replace(",", " ");
                                sortByTagInput.value = tags;
                                sortByTag();
                                break
                        }
                    }
                }
            )
        });


    //Add listeners

    searchInput.onkeyup = function (e) {
        console.log(searchInput.value);
        iterator = 0;
        addFilteredData(searchInput.value, 10);
    };

    sortByDateButton.addEventListener('click', sortByDate);

    sortByTagButton.addEventListener('click', sortByTag);
    buttonReset.addEventListener('click', reset);


};

window.onscroll = function () {

    let scrollTop = document.documentElement.scrollTop;
    let windowHeight = window.innerHeight;
    let bodyHeight = document.documentElement.offsetHeight - windowHeight;
    let scrollPercentage = (scrollTop / bodyHeight);

    if (scrollPercentage >= 0.999 && primaryDataList !== undefined && (iterator * 10 < displayedDataList.length)) {

        debugger;

        //make reset button visible
        buttonReset.className = "";

        if ((iterator + 1) * 10 > displayedDataList.length) {
            addData(displayedDataList, displayedDataList.length - (iterator) * 10);
        } else {
            addData(displayedDataList, 10)
        }
    }
};





