var div = document.getElementById("cgroup");
var groups = JSON.parse(strgroups);

groups.forEach(function(group) {
div.innerHTML += `
<li class="collection-item avatar">
    <img src="`+ group.GroupImageURL +`" alt="" class="circle">
    <span class="title">`+group.Groupname+`</span>
    <p>
    Genre : `+group.Genre+`
    <br>
    Second Line
    </p>
    <a href="#!" class="secondary-content"><i class="medium material-icons">view_module</i></a>
</li>`;
    
}, this);