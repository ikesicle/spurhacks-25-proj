<script>
  import { createScript, updateScript } from '../lib/api.js';
  import { createEventDispatcher } from 'svelte';
  
  export let editingScript = null;
  let form = {
    name: '',
    language: '',
    tags: '',
    description: '',
    content: ''
  };

  const dispatch = createEventDispatcher();

  $: if (editingScript) {
    form = { ...editingScript };
  }

  async function save() {
    if (editingScript) {
      await updateScript(editingScript._id, form);
    } else {
      await createScript(form);
    }
    dispatch('done');
  }
</script>

<div class="border p-2 my-2">
  <input placeholder="Name" bind:value={form.name} class="border p-1 mb-1 w-full" />
  <input placeholder="Language" bind:value={form.language} class="border p-1 mb-1 w-full" />
  <input placeholder="Tags" bind:value={form.tags} class="border p-1 mb-1 w-full" />
  <input placeholder="Description" bind:value={form.description} class="border p-1 mb-1 w-full" />
  <textarea placeholder="Content" bind:value={form.content} class="border p-1 mb-1 w-full" rows="5"></textarea>
  <button on:click={save} class="border px-2 py-1 mr-2">Save</button>
  <button on:click={() => dispatch('done')} class="border px-2 py-1">Cancel</button>
</div>