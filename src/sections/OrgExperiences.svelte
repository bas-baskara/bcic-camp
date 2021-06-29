<script>
    import _ from 'lodash'
    import DateString from '@/helper/DateString.js'
    import XIcon from '@/extra/XIcon.svelte'
    import PlusCircle from '@/extra/PlusCircle.svelte'

    export let baseUrl
    let textArea = false, orgNumber = 0
    $: hiddenCert = (function(i) {
        if ( i != 0 && i > orgNumber ) return true

        return false
    })

    const years = [...Array(21).keys()].map(i => (i + 2001).toString())

    const emptyStr = (val) => val.trim() == ''
    const nonEmptyStr = (val) => val.trim() !== ''
    const scanErr = (function(obj) {
        const values = Object.values(obj)
        return ( values.every(emptyStr) || values.every(nonEmptyStr) )
    })

    const orgExpObj = {
        title: '',
        organization: '',
        startMonth: '',
        startYear: '',
        start: '',
        endMonth: '',
        endYear: '',
        end: '',
        description: ''
    }

    const orgExperiences = []

    function newOrgExperiences() {
        for (let i = 0; i < 50; i++) {
            orgExperiences[i] = _.cloneDeep(orgExpObj)
        }
        return
    }

    newOrgExperiences()

    const getDataOrgExperiences = (function() {
        fetch(baseUrl + 'org-experiences/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())
        .then(data => {
            newOrgExperiences()

            data.forEach((val, i) => {
                const whenStart = val.start.split('-')
                const whenEnd = val.end.split('-')

                orgExperiences[i] = {
                    title: val.title,
                    organization: val.organization,
                    start: val.start,
                    startMonth: whenStart[1],
                    startYear: whenStart[0],
                    end: val.end,
                    endMonth: whenEnd[1],
                    endYear: whenEnd[0],
                    description: val.description,
                    id: val.id.toString()
                }
            })

            if (orgNumber < data.length) orgNumber = data.length - 1
        })
    })

    getDataOrgExperiences()



    function autoUpdateOrgExperiences(orgExp) {
        if ( 'id' in orgExp ) orgExp.id = orgExp.id.toString()
        if ( !Object.values(orgExp).every(nonEmptyStr) ) return
        orgExp.start = orgExp.startYear + '-' + orgExp.startMonth
        orgExp.end = orgExp.endYear + '-' + orgExp.endMonth

        const body = new FormData
        for ( let[key, value] of Object.entries(orgExp) ) {
            body.append(key, value)
        }

        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-org-experiences', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            getDataOrgExperiences()
        })

    }

    function Del(id) {
        newOrgExperiences()

        if (id !== undefined) {
            fetch(baseUrl + 'org-experiences/' + id + '/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, { method: 'DELETE' })
            .then(response => {
                if (response.status === 200) {
                    getDataOrgExperiences()
                }
            })
        } else {
            getDataOrgExperiences()
        }

        if ( orgNumber > 0 ) orgNumber--
        
        return
    }



</script>


<p class="text-xs text-justify md:text-base">Untuk Data Pengalaman Organisasi, Mohon Sebutkan Data Pengalaman Organisasi Yang anda Miliki Mulai Dari Yang Paling akhir Anda Lakukan!</p>
    

<div class="my-4 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 font-bold text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Data Pengalaman Organisasi Selama 10 Tahun Terakhir</div>

      
    <div class="mt-1 lg:mt-0 lg:grid { textArea ? 'lg:grid-cols-12':'lg:grid-cols-6' }">
        <div class="hidden lg:block p-2 bg-yellow-500 text-center"></div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Posisi/<br>Jabatan</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Organisasi</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Tahun/<br>Bulan Mulai</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Tahun/<br>Bulan Selesai</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center { textArea ? 'col-span-7':'' }">Deskripsi<br>Singkat</div>

        {#each orgExperiences as val, i }
        <div class="{ hiddenCert(i) ? 'hidden':'' } mb-1 md:mt-8 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black lg:mt-0 flex items-center justify-between">Pengalaman Org.<span class="text-xs text-red-500" on:click="{() => Del(val.id)}"><XIcon/></span></div>

        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.title.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Posisi/Jabatan" bind:value="{val.title}" on:change="{() => autoUpdateOrgExperiences(val)}">

        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.organization.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Organisasi" bind:value="{val.organization}" on:change="{() => autoUpdateOrgExperiences(val)}">

        <div class="flex items-center { hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.start.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}">
            <select class="bg-white w-1/2" bind:value="{val.startMonth}" on:blur="{() => autoUpdateOrgExperiences(val)}">
                <option value="">Bulan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">Nopember</option>
                <option value="12">Desember</option>
            </select>
            <select class="bg-white w-1/2" bind:value="{val.startYear}" on:blur="{() => autoUpdateOrgExperiences(val)}">
                <option value="">Tahun</option>
                {#each years as year}
                    <option value="{year}">{year}</option>
                {/each}
            </select>
        </div>



        <div class="flex items-center { hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.end.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}">
            <input class="hidden" bind:value="{val.end}">
             <select class="bg-white w-1/2" bind:value="{val.endMonth}" on:blur="{() => autoUpdateOrgExperiences(val)}">
                 <option value="">Bulan</option>
                 <option value="01">Januari</option>
                 <option value="02">Februari</option>
                 <option value="03">Maret</option>
                 <option value="04">April</option>
                 <option value="05">Mei</option>
                 <option value="06">Juni</option>
                 <option value="07">Juli</option>
                 <option value="08">Agustus</option>
                 <option value="09">September</option>
                 <option value="10">Oktober</option>
                 <option value="11">Nopember</option>
                 <option value="12">Desember</option>
             </select>
             <select class="bg-white w-1/2" bind:value="{val.endYear}" on:blur="{() => autoUpdateOrgExperiences(val)}">
                 <option value="">Tahun</option>
                 {#each years as year}
                     <option value="{year}">{year}</option>
                 {/each}
             </select>
         </div>
 

        <textarea name="" id="" rows="1" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring { textArea ? 'col-span-7':'' } {val.description.trim() == '' ? '':' border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Deskripsi Singkat" on:focus="{e => {textArea = true; e.target.rows='3'} }" on:blur="{e => {textArea = false; e.target.rows='1'} }" bind:value="{val.description}" on:change="{() => autoUpdateOrgExperiences(val)}"></textarea>

        {/each}

    </div>

    <div class="px-4 flex justify-end {orgNumber > 8 ? 'hidden':''}">
        <div class="min-w-min cursor-pointer" on:click="{() => orgNumber++}">
            <PlusCircle elClass="text-yellow-500 h-8 w-8"/>
        </div>
    </div>

</div>
