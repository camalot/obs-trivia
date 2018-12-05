<h4 class="mdl-card__title-text">{{#if error.status}}{{error.status}}{{else}}ERROR{{/if}}</h4>
<h4 class="">{{message}}</h4>
{{#if error.stack}}
<h4 class="">
	<pre>{{error.stack}}</pre>
</h4>
{{/if}}
