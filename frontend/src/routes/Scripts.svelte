<script>
  import { onMount } from 'svelte';
  import { fetchScripts, searchScripts, createScript, deleteScript, runScriptLocally } from '../lib/api.js';
  import ScriptForm from './ScriptForm.svelte';

  let scripts = [];
  let searchTerm = '';
  let showForm = false;
  let editingScript = null;

  async function loadScripts() {
    scripts = await fetchScripts();
  }

  async function doSearch() {
    if (searchTerm) {
      scripts = await searchScripts(searchTerm);
    } else {
      loadScripts();
    }
  }

  async function handleDelete(id) {
    if (confirm("Delete this script?")) {
      await deleteScript(id);
      loadScripts();
    }
  }

  async function handleRun(script) {
    if (confirm(`Run script "${script.name}"?`)) {
      runScriptLocally(script);
    }
  }

  function handleEdit(script) {
    editingScript = script;
    showForm = true;
  }

  function handleNew() {
    editingScript = null;
    showForm = true;
  }

  function formDone() {
    showForm = false;
    loadScripts();
  }

  onMount(loadScripts);
</script>

<div class="mb-2">
  <input placeholder="Search..." bind:value={searchTerm} class="border p-1 mr-2" on:input={doSearch} />
  <button on:click={handleNew} class="border px-2 py-1">New Script</button>
</div>

{#if showForm}
  <ScriptForm {editingScript} on:done={formDone} />
{/if}

<table class="border mt-4">
  <thead>
    <tr>
      <th class="border p-1">Name</th>
      <th class="border p-1">Language</th>
      <th class="border p-1">Tags</th>
      <th class="border p-1">Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each scripts as script}
      <tr>
        <td class="border p-1">{script.name}</td>
        <td class="border p-1">{script.language}</td>
        <td class="border p-1">{script.tags}</td>
        <td class="border p-1">
          <button on:click={() => handleRun(script)} class="text-green-600">Run</button>
          <button on:click={() => handleEdit(script)} class="text-blue-600 ml-2">Edit</button>
          <button on:click={() => handleDelete(script._id)} class="text-red-600 ml-2">Delete</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>