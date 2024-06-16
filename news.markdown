---
layout: default
title:  "News"
---


<div class="container">
    <h2>The news reel</h2>
    <p>Find all the latest updates and news from the Canopy Resilience Project posted here.</p>
    {% for post in site.posts %}
    <div class="row m-2">
        <div class="col-1 text-cetner"> 
            <i class="{{ post.icon }}" style="font-size:60px;color:rgba(255, 255, 255, 0.8)"></i>
        </div>
        <div class="col-11">
            <h4>{{ post.title }}</h4>
            <h5>{{ post.date | date: "%-d %B %Y" }}</h5>
            <p>{{ post.excerpt }}</p>
        </div>
        <hr>
    </div>
    {% endfor %}
</div>