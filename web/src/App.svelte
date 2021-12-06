<script lang="ts">
  import { Stretch } from "svelte-loading-spinners";
  import * as rpc from "@regquery/rpc";
  import { Builtins } from "@regquery/loader";
  import type { BaseLoader } from "@regquery/loader";
  import Paragraph from "./Paragraph.svelte";

  const loaders = [new Builtins.DOCXLoader.Loader({})];

  let files: string[] = [];
  let query: string;
  let wrongQuery: boolean = false;
  let items: BaseLoader.IContent[] = [];
  let search: BaseLoader.IContent[] = [];
  let loading = false;

  $: {
    try {
      if (!!query) {
        const q = RegExp(query);
        search = items
          .filter(
            (item) => !!item.objects.find((e) => q.test(e.object.content))
          )
          .map((el) => ({
            ...el,
            objects: el.objects.filter((e) => q.test(e.object.content)),
          }));
        wrongQuery = false;
      } else {
        search = items;
        wrongQuery = false;
      }
    } catch (err) {
      console.error(err);
      wrongQuery = true;
    }
  }

  async function onClickFilePicker() {
    try {
      loading = true;
      files = await rpc.MultipleRegulationsFilePicker();
      const nextItems = [];
      for (const f of files) {
        for (const p of loaders) {
          try {
            if (p.test(f)) {
              const res = await p.extract(f);
              const result = await p.transform(f, res);
              nextItems.push(result);
            }
          } catch (error) {
            console.error("File failed:", f, error);
          }
        }
      }

      items = nextItems;
      search = nextItems;
    } catch (error) {
      console.error(error);
      files = [];
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <h1>RegQuery</h1>

  <section>
    <input
      type="file"
      multiple
      accept=".docx,.json"
      on:click={onClickFilePicker}
    />
  </section>

  {#if files.length}
    {#each files as file}
      <section>
        <ul>
          <li>{file}</li>
        </ul>
      </section>
    {/each}

    {#if loading}
      <Stretch size="60" color="#FF3E00" unit="px" duration="1s" />
    {/if}

    {#if !loading}
      <section>
        <input type="text" bind:value={query} />
        {#if wrongQuery}
          <p>格式錯誤</p>
        {/if}
      </section>

      {#each search as item}
        <section>
          <h2>{item.title} ({item.objects.length})</h2>
          {#if item.objects.length}
            <ul>
              {#each item.objects as obj}
                <li>
                  <span class:badge={true}>{obj.object.title}</span>
                  <Paragraph text={obj.object.content} regsrc={query} />
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/each}
    {/if}
  {/if}
</main>

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  .badge {
    padding: 3px;
    background-color: blue;
    color: #fff;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
