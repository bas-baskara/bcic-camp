<script>
    import _ from 'lodash'
    import { navigate } from 'svelte-routing'
    import Swal from 'sweetalert2'
    import Processing from '@/extra/Processing.svelte'
    import ArrowCircleRight from '@/extra/ArrowCircleRight.svelte'
    import ArrowCircleLeft from '@/extra/ArrowCircleLeft.svelte'
    import XIcon from '@/extra/XIcon.svelte'
    import PlusCircle from '@/extra/PlusCircle.svelte'

    export let baseUrl

    let textArea = false, achievNumber = 0
    $: hiddenCert = (function(i) {
        if ( i != 0 && i > achievNumber ) return true

        return false
    })



    const emptyStr = (val) => val.trim() == ''
    const nonEmptyStr = (val) => val.trim() !== ''
    const scanErr = (function(obj) {
        const values = Object.values(obj)
        return ( values.every(emptyStr) || values.every(nonEmptyStr) )
    })

    const achievObj = {
        title: '',
        field: '',
        year: '',
        scope: '',
        description: ''
    }
    const achievements = []

    function newAchievements() {
        for ( let i = 0; i < 10; i++ ) {
            achievements[i] = _.cloneDeep(achievObj)
        }
        return
    }

    newAchievements()

    const  getDataAchievements = (function() {
        fetch(baseUrl + 'achievements-history/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())
        .then(data => {
            
            newAchievements()

            data.forEach((val, i) => {
                achievements[i] = {
                    title: val.title,
                    field: val.field,
                    year: val.year,
                    scope: val.scope,
                    description: val.description,
                    id: val.id.toString()
                }
            })

            if (achievNumber < data.length) achievNumber = data.length - 1
        })
    })

    getDataAchievements()



    function autoUpdateAchievement(achievement) {
        if ( 'id' in achievement ) achievement.id = achievement.id.toString()
        if ( !Object.values(achievement).every(nonEmptyStr) ) return

        const body = new FormData
        for ( let[key, value] of Object.entries(achievement) ) {
            body.append(key, value)
        }

        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-user-achievements', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            console.log('update achivement', data)
            getDataAchievements()
        })

    }

    function Del(id) {
        newAchievements()

        if (id !== undefined) {
            fetch(baseUrl + 'achievements-history/' + id + '/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, { method: 'DELETE' })
            .then(response => {
                if (response.status === 200) {
                    getDataAchievements()
                }
            })
        } else {
            getDataAchievements()
        }

        if ( achievNumber > 0 ) achievNumber--
        
        return
    }
</script>

<div class="my-8 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 font-bold text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Data Pencapaian Yang Pernah Diperoleh 8 tahun Terakhir</div>
    
    <div class="mt-1 lg:mt-0 lg:grid { textArea ? 'lg:grid-cols-12':'lg:grid-cols-6' }">
        <div class="hidden lg:block p-2 bg-yellow-500 text-center"></div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Judul<br>Penghargaan</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Bidang<br>Penghargaan</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Tahun<br>Diperoleh</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Lingkup<br>Penghargaan*</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center { textArea ? 'col-span-7':'' }">Deskripsi<br>Singkat</div>

        {#each achievements as val, i }

        <div class="{ hiddenCert(i) ? 'hidden':'' } mb-1 md:mt-8 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black lg:mt-0 flex items-center justify-between">Pencapaian<span class="text-xs text-red-500" on:click="{() => Del(val.id)}"><XIcon/></span></div>

        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.title.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Judul Penghargaan" bind:value="{val.title}" on:change="{() => autoUpdateAchievement(val)}">

        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.field.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Nama Bidang" bind:value="{val.field}" on:change="{() => autoUpdateAchievement(val)}">

        <input class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 rounded w-full border text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.year.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" type="text" maxlength="4" placeholder="Tahun Diperoleh" on:input="{e => e.target.value = e.target.value.replace(/[^0-9]/g, '')}" bind:value="{val.year}" on:change="{() => autoUpdateAchievement(val)}">

        <select name="" id="" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border w-full bg-white text-xs text-gray-500 md:text-sm focus:ring-yellow-500 focus:ring {val.scope.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Lingkup Penghargaan (Lokal/Nasional/Internasional)" bind:value="{val.scope}" on:blur="{() => autoUpdateAchievement(val)}">
            <option value="">Lingkup Penghargaan</option>
            <option value="lokal">Lokal</option>
            <option value="nasional">Nasional</option>
            <option value="internasional">Internasional</option>
        </select>

        <textarea name="" id="" rows="1" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring { textArea ? 'col-span-7':'' } {val.description.trim() == '' ? '':' border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Deskripsi Singkat" on:focus="{e => {textArea = true; e.target.rows='3'} }" on:blur="{e => {textArea = false; e.target.rows='1'} }" bind:value="{val.description}" on:change="{() => autoUpdateAchievement(val)}"></textarea>

        {/each}

    </div>

    <div class="px-4 flex justify-end {achievNumber > 8 ? 'hidden':''}">
        <div class="min-w-min cursor-pointer" on:click="{() => achievNumber++}">
            <PlusCircle elClass="text-yellow-500 h-8 w-8"/>
        </div>
    </div>

</div>