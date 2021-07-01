<script>
    import _ from 'lodash'
    import { navigate } from 'svelte-routing'
    import Swal from 'sweetalert2'
    import DateString from '@/helper/DateString.js'
    import Processing from '@/extra/Processing.svelte'
    import ArrowCircleRight from '@/extra/ArrowCircleRight.svelte'
    import ArrowCircleLeft from '@/extra/ArrowCircleLeft.svelte'
    import XIcon from '@/extra/XIcon.svelte'
    import PlusCircle from '@/extra/PlusCircle.svelte'
    import OrgExperiences from './OrgExperiences.svelte'

    export let baseUrl
    let textArea = false, jobNumber = 0, submitting = false
    $: hiddenCert = (function(i) {
        if ( i != 0 && i > jobNumber ) return true

        return false
    })

    const years = [...Array(21).keys()].map(i => (i + 2001).toString())

    const emptyStr = (val) => val.trim() == ''
    const nonEmptyStr = (val) => val.trim() !== ''
    const scanErr = (function(obj) {
        const values = Object.values(obj)
        return ( values.every(emptyStr) || values.every(nonEmptyStr) )
    })

    const jobExpObj = {
        title: '',
        company: '',
        startMonth: '',
        startYear: '',
        start: '',
        endMonth: '',
        endYear: '',
        end: '',
        description: ''
    }

    const jobExperiences = []

    function newJobExperiences() {
        for (let i = 0; i < 50; i++) {
            jobExperiences[i] = _.cloneDeep(jobExpObj)
        }
        return
    }

    newJobExperiences()

    const getDataJobExperiences = (function() {
        fetch(baseUrl + 'job-experiences/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())
        .then(data => {
            console.log('getDataJobExperiences', jobExpObj)

            newJobExperiences()

            data.forEach((val, i) => {
                const whenStart = val.start.split('-')
                const whenEnd = val.end.split('-')

                jobExperiences[i] = {
                    title: val.title,
                    company: val.company,
                    start: val.start,
                    startMonth: whenStart[1],
                    startYear: whenStart[0],
                    end: val.end,
                    endMonth: whenEnd[1],
                    endYear: whenEnd[0],
                    description: val.description,
                    id: val.id.toString()
                }

                // jobExperiences[i].startMonth = whenStart[0]

                console.log('from server', jobExperiences[i])
                


            })

            if (jobNumber < data.length) jobNumber = data.length - 1
        })
    })

    getDataJobExperiences()



    function autoUpdateJobExperiences(jobExp) {
        if ( 'id' in jobExp ) jobExp.id = jobExp.id.toString()
        if ( !Object.values(jobExp).every(nonEmptyStr) ) return

        jobExp.start = jobExp.startYear + '-' + jobExp.startMonth
        jobExp.end = jobExp.endYear + '-' + jobExp.endMonth

        const body = new FormData
        for ( let[key, value] of Object.entries(jobExp) ) {
            body.append(key, value)
        }

        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-job-experiences', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            getDataJobExperiences()
        })

    }

    function Del(id) {
        newJobExperiences()

        if (id !== undefined) {
            fetch(baseUrl + 'job-experiences/' + id + '/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, { method: 'DELETE' })
            .then(response => {
                if (response.status === 200) {
                    getDataJobExperiences()
                }
            })
        } else {
            getDataJobExperiences()
        }

        if ( jobNumber > 0 ) jobNumber--
        
        return
    }


    function submit() {
        submitting = true

        nextStep()
    }

    function nextStep() {
        fetch(baseUrl + 'next-step/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            console.log('nextStep', data)
            if ( data.status == 'ok' ) navigate('/camp-bcic/form/profil-usaha')
        })
        .catch(err => {

            submitting = false
            Swal.fire({
                title: 'Gagal',
                text: 'Pastikan koneksi internet anda stabil!',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#3984fb'
            })

            setTimeout(() => {
                location.reload()
            }, 2000);
        })
    }

</script>


<p class="text-xs text-justify md:text-base">Untuk Data Pengalaman Kerja, Mohon Sebutkan Data Mulai dari yang Paling Terakhir Anda Alami!</p>
    

<div class="my-4 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 font-bold text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Data Pengalaman Kerja (Termasuk Magang)</div>

      
    <div class="mt-1 lg:mt-0 lg:grid { textArea ? 'lg:grid-cols-12':'lg:grid-cols-6' }">
        <div class="hidden lg:block p-2 bg-yellow-500 text-center"></div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Posisi/<br>Jabatan</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Institusi</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Tahun/<br>Bulan Mulai</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Tahun/<br>Bulan Selesai</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center { textArea ? 'col-span-7':'' }">Deskripsi<br>Singkat</div>

        {#each jobExperiences as val, i }
        <div class="{ hiddenCert(i) ? 'hidden':'' } mb-1 md:mt-8 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black lg:mt-0 flex items-center justify-between">Pengalaman Kerja<span class="text-xs text-red-500" on:click="{() => Del(val.id)}"><XIcon/></span></div>

        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.title.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Posisi/Jabatan" bind:value="{val.title}" on:change="{() => autoUpdateJobExperiences(val)}">

        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.company.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="institusi/perusahaan" bind:value="{val.company}" on:change="{() => autoUpdateJobExperiences(val)}">


        <div class="flex items-center { hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.start.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}">
             <select class="bg-white w-1/2" bind:value="{val.startMonth}" on:blur="{() => autoUpdateJobExperiences(val)}">
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
             <select class="bg-white w-1/2" bind:value="{val.startYear}" on:blur="{() => autoUpdateJobExperiences(val)}">
                 <option value="">Tahun</option>
                 {#each years as year}
                     <option value="{year}">{year}</option>
                 {/each}
             </select>
         </div>
 
 
 
         <div class="flex items-center { hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded lg:rounded-none w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.end.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}">
              <select class="bg-white w-1/2" bind:value="{val.endMonth}" on:blur="{() => autoUpdateJobExperiences(val)}">
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
              <select class="bg-white w-1/2" bind:value="{val.endYear}" on:blur="{() => autoUpdateJobExperiences(val)}">
                  <option value="">Tahun</option>
                  {#each years as year}
                      <option value="{year}">{year}</option>
                  {/each}
              </select>
          </div>

        <textarea name="" id="" rows="1" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring { textArea ? 'col-span-7':'' } {val.description.trim() == '' ? '':' border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Deskripsi Singkat" on:focus="{e => {textArea = true; e.target.rows='3'} }" on:blur="{e => {textArea = false; e.target.rows='1'} }" bind:value="{val.description}" on:change="{() => autoUpdateJobExperiences(val)}"></textarea>

        {/each}

    </div>

    <div class="px-4 flex justify-end {jobNumber > 8 ? 'hidden':''}">
        <div class="min-w-min cursor-pointer" on:click="{() => jobNumber++}">
            <PlusCircle elClass="text-yellow-500 h-8 w-8"/>
        </div>
    </div>

</div>

<OrgExperiences {baseUrl}/>


<div class="p-2 flex justify-between">
    
    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{() => navigate('/camp-bcic/form/pendidikan-dan-pencapaian')}"><ArrowCircleLeft/> Sebelumnya</button>

    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{submit}">Lanjutkan <ArrowCircleRight/></button>
</div>

{#if submitting}
<Processing/>
{/if}