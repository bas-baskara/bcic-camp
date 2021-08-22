<script>
    import _ from 'lodash'
    import { navigate } from 'svelte-routing'
    import Swal from 'sweetalert2'
    import Processing from '@/extra/Processing.svelte'
    import ArrowCircleRight from '@/extra/ArrowCircleRight.svelte'
    import ArrowCircleLeft from '@/extra/ArrowCircleLeft.svelte'
    import XIcon from '@/extra/XIcon.svelte'
    import PlusCircle from '@/extra/PlusCircle.svelte'

    import Achievement from './Achievement.svelte'


    export let baseUrl
    let submitting = false
    let certNumber = 0
    const eduObj = {institution: '',major: '',graduation_year: '', id: ''}
    
    function getEduFormalHistories() {

        fetch(baseUrl + 'edu-formal-history/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())
        .then(data => {

            for ( let [key, value] of Object.entries(eduObj) ) {
                edu.sma[key] = value
                edu.diploma[key] = value
                edu.s1[key] = value
                edu.s2[key] = value
            }

            data.forEach(val => {
                edu[val.level] = {
                    institution: val.institution,
                    major: val.major,
                    graduation_year: val.graduation_year.toString(),
                    id: val.id.toString()
                }
            })
        })
    }

    const edu = {
        sma: _.cloneDeep(eduObj),
        diploma: _.cloneDeep(eduObj),
        s1: _.cloneDeep(eduObj),
        s2: _.cloneDeep(eduObj),
    }
    
    
    getEduFormalHistories()


    const nonFormalObj = {
            title: '',
            institution: '',
            graduation_year: '',
        }

    
    const certificates = []

    function newCert() {
        for (let i = 0; i < 10; i++) {
            certificates[i] = _.cloneDeep(nonFormalObj)
        }
        return
    }

    newCert()

    $: hiddenCert = (function(i) {
        if ( i != 0 && i > certNumber ) return true

        return false
    })

    $: showX = function(i) {
        if (i != 0 && i == certNumber ) return true

        return false
    }
    

    const emptyStr = (val) => val.trim() == ''
    const nonEmptyStr = (val) => val.trim() != ''

    function scanErr(obj) {
        const values = Object.values(obj)
        return ( values.every(emptyStr) || values.every(nonEmptyStr) )
    }

    function autoUpdateFormal(level) {
        // console.log('cek sma', sma)
        
        const form = _.cloneDeep(edu[level])
        delete form.id
        
        console.log('every', Object.values(form).every(nonEmptyStr))

        if ( !Object.values(form).every(nonEmptyStr) ) return

        const body = new FormData

        for ( let[key, value] of Object.entries(form) ) {
            body.append(key, value)
        }

        body.append('level', level)
        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-formal-edu-histories', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            console.log('store edu', data)
            getEduFormalHistories()
        })
        
    }

    function delFormal(id, level) {
        if (id === undefined ) return
        fetch(baseUrl + 'edu-formal-history/' + id + '/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {method: 'DELETE'})
        .then(response => {
            if (response.status == 200) {
                getEduFormalHistories()
            }
        })
    }
    

    function getNonFormalEduHistories() {
        fetch(baseUrl + 'edu-non-formal-history/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())
        .then(data => {
            console.log('getnonformal', data)
            newCert()
            data.forEach((val, i) => {
                for ( let [key, value] of Object.entries(val) ) {
                    certificates[i][key] = value.toString()
                }
            })
            if (certNumber < data.length) certNumber = data.length - 1
        })
    }

    getNonFormalEduHistories()



    function autoUpdateCertificate(i) {
        console.log('certificate to update', certificates[i])
        if ( !Object.values(certificates[i]).every(nonEmptyStr) ) return

        const body = new FormData

        for ( let [key, value] of Object.entries(certificates[i]) ) {
            body.append(key, value)
        }

        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-non-formal-edu-histories', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            console.log('update certificates', data)
            getNonFormalEduHistories()
        })
    }

  

    function certDel(id) {
        if (id !== undefined) {
            fetch(baseUrl + 'edu-non-formal-history/' + id + '/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, { method: 'DELETE' })
            .then(response => {
                if (response.status === 200) {
                    newCert()
                    getNonFormalEduHistories()
                }
            })
        } else {
            newCert()
            getNonFormalEduHistories()
        }
        
        certNumber --
    }

    function submit() {
        submitting = true
        // console.log('sma', edu.sma)
        setTimeout(() => {
            if ( !Object.values(edu.sma).every(nonEmptyStr) ) {
                submitting = false
                Swal.fire({
                    title: 'Data Belum Lengkap',
                    text: 'Silakan lengkapi kolom yang harus diisi!',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#3984fb'
                })
    
                return
            }
    
            nextStep()
            
        }, 100);
    }

    function nextStep() {
        fetch(baseUrl + 'next-step/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            console.log('nextStep', data)
            if ( data.status == 'ok' ) navigate('/camp-bcic/form/pengalaman-kerja-dan-organisasi')
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


<p class="text-xs text-justify md:text-base">Untuk Data Pendidikan, Mohon Sebutkan Data Sesuai Dengan Ijazah atau Sertifikat Yang Anda Miliki</p>
    

<div class="my-4 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 font-bold text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Data Pendidikan Formal</div>
    
    <div class="mt-1 lg:mt-0 lg:grid lg:grid-cols-4">
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Pendidikan</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Institusi</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Jurusan/Konsentrasi</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Tahun Lulus</div>

        <div class="mb-1 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black">SMA dan Sederajat</div>
        <input type="text" class="mb-1 p-2 border rounded w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.sma.institution.trim() == '' ? 'border-red-500':'border-blue-300'}" placeholder="Nama Institusi" bind:value="{edu.sma.institution}" on:change="{() => autoUpdateFormal('sma')}">
        <input type="text" class="mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.sma.major.trim() == '' ? 'border-red-500':'border-blue-300'}" placeholder="Nama Jurusan/Konsentrasi" bind:value="{edu.sma.major}" on:change="{() => autoUpdateFormal('sma')}">
        <input class="mb-1 py-2 px-4 w-full rounded border text-xs md:text-sm  {edu.sma.graduation_year.trim() == '' ? 'border-red-500':'border-blue-300'}" type="text" maxlength="4" bind:value="{edu.sma.graduation_year}" placeholder="Tahun Lulus" on:input="{e => e.target.value = e.target.value.replace(/[^0-9]/g, '')}" on:change="{() => autoUpdateFormal('sma')}">

        <div class="mb-1 mt-4 md:mt-8 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black lg:mt-0 flex items-center justify-between">Diploma<span class="text-xs text-red-500 {edu.diploma.id ? '':'hidden'}" on:click="{() => delFormal(edu.diploma.id)}"><XIcon/></span></div>
        <input type="text" class="mb-1 p-2 border rounded w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.diploma.institution.trim() == '' ? '':'border-blue-300'} {scanErr(edu.diploma) ? '':'border-red-500'}" placeholder="Nama Institusi" bind:value="{edu.diploma.institution}" on:change="{() => autoUpdateFormal('diploma')}">
        <input type="text" class="mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.diploma.major.trim() == '' ? '':'border-blue-300'} {scanErr(edu.diploma) ? '':'border-red-500'}" placeholder="Nama Jurusan/Konsentrasi" bind:value="{edu.diploma.major}" on:change="{() => autoUpdateFormal('diploma')}">
        <input class="mb-1 py-2 px-4 rounded w-full border text-xs md:text-sm  {edu.diploma.graduation_year.trim() == '' ? '':'border-blue-300'} {scanErr(edu.diploma) ? '':'border-red-500'}" type="text" maxlength="4" bind:value="{edu.diploma.graduation_year}" placeholder="Tahun Lulus" on:input="{e => e.target.value = e.target.value.replace(/[^0-9]/g, '')}" on:change="{() => autoUpdateFormal('diploma')}">

        <div class="mb-1 mt-4 md:mt-8 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black lg:mt-0 flex items-center justify-between">Sarjana (s1)<span class="text-xs text-red-500 {edu.s1.id ? '':'hidden'}" on:click="{() => delFormal(edu.s1.id)}"><XIcon/></span></div>
        <input type="text" class="mb-1 p-2 border rounded w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.s1.institution.trim() == '' ? '':'border-blue-300'} {scanErr(edu.s1) ? '':'border-red-500'}" placeholder="Nama Institusi" bind:value="{edu.s1.institution}" on:change="{() => autoUpdateFormal('s1')}">
        <input type="text" class="mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.s1.major.trim() == '' ? '':'border-blue-300'} {scanErr(edu.s1) ? '':'border-red-500'}" placeholder="Nama Jurusan/Konsentrasi" bind:value="{edu.s1.major}" on:change="{() => autoUpdateFormal('s1')}">
        <input class="mb-1 py-2 px-4 rounded w-full border text-xs md:text-sm  {edu.s1.graduation_year.trim() == '' ? '':'border-blue-300'} {scanErr(edu.s1) ? '':'border-red-500'}" type="text" maxlength="4" bind:value="{edu.s1.graduation_year}" placeholder="Tahun Lulus" on:input="{e => e.target.value = e.target.value.replace(/[^0-9]/g, '')}" on:change="{() => autoUpdateFormal('s1')}">

        <div class="mb-1 mt-4 md:mt-8 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black lg:mt-0 flex items-center justify-between">Pascasarjana (s2)<span class="text-xs text-red-500 {edu.s2.id ? '':'hidden'}" on:click="{() => delFormal(edu.s2.id)}"><XIcon/></span></div>
        <input type="text" class="mb-1 p-2 border rounded w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.s2.institution.trim() == '' ? '':'border-blue-300'} {scanErr(edu.s2) ? '':'border-red-500'}" placeholder="Nama Institusi" bind:value="{edu.s2.institution}" on:change="{() => autoUpdateFormal('s2')}">
        <input type="text" class="mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {edu.s2.major.trim() == '' ? '':'border-blue-300'} {scanErr(edu.s2) ? '':'border-red-500'}" placeholder="Nama Jurusan/Konsentrasi" bind:value="{edu.s2.major}" on:change="{() => autoUpdateFormal('s2')}">
        <input class="mb-1 py-2 px-4 rounded w-full border text-xs md:text-sm  {edu.s2.graduation_year.trim() == '' ? '':'border-blue-300'} {scanErr(edu.s2) ? '':'border-red-500'}" type="text" maxlength="4" bind:value="{edu.s2.graduation_year}" placeholder="Tahun Lulus" on:input="{e => e.target.value = e.target.value.replace(/[^0-9]/g, '')}" on:change="{() => autoUpdateFormal('s2')}">




    </div>
</div>

 <!-- <hr class="border-2 border-dashed"> -->

<div class="my-8 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 font-bold text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Data Pendidikan Non Formal</div>
    
    <div class="mt-1 lg:mt-0 lg:grid lg:grid-cols-4">
        <div class="hidden lg:block p-2 bg-yellow-500 text-center"></div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Institusi</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Konsentrasi/Nama Sertifikasi</div>
        <div class="hidden lg:block p-2 bg-yellow-500 text-center">Tahun</div>

        {#each certificates as val, i }

        <div class="{ hiddenCert(i) ? 'hidden':'' } mb-1 { i > 0 ? 'mt-4':''}  md:mt-8 px-2 py-1 bg-yellow-500 text-white text-sm md:py-2 md:text-base lg:border lg:bg-white lg:text-black lg:mt-0 flex items-center justify-between">Sertifikat<span class="text-xs text-red-500" on:click="{() => certDel(val.id)}"><XIcon/></span></div>
        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border rounded w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.institution.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Nama Institusi" bind:value="{val.institution}" on:change="{() => autoUpdateCertificate(i)}">
        <input type="text" class="{ hiddenCert(i) ? 'hidden':'' } mb-1 p-2 border w-full text-xs md:text-sm focus:ring-yellow-500 focus:ring {val.title.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" placeholder="Nama Jurusan/Konsentrasi" bind:value="{val.title}" on:change="{() => autoUpdateCertificate(i)}">
        <input class="{ hiddenCert(i) ? 'hidden':'' } mb-1 py-2 px-4 rounded w-full border text-xs md:text-sm  {val.graduation_year.trim() == '' ? '':'border-blue-300'} {scanErr(val) ? '':'border-red-500'}" type="text" maxlength="4" bind:value="{val.graduation_year}" placeholder="Tahun" on:input="{e => e.target.value = e.target.value.replace(/[^0-9]/g, '')}" on:change="{() => autoUpdateCertificate(i)}">

        {/each}

    </div>

    <div class="px-4 flex justify-end {certNumber > 4 ? 'hidden':''}">
        <div class="min-w-min cursor-pointer" on:click="{() => certNumber++}">
            <PlusCircle elClass="text-yellow-500 h-8 w-8"/>
        </div>
    </div>

</div>

<Achievement {baseUrl} />

<div class="p-2 flex justify-between">
    
    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{() => navigate('/camp-bcic/form/biodata')}"><ArrowCircleLeft/> Sebelumnya</button>

    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{submit}">Lanjutkan <ArrowCircleRight/></button>
</div>

{#if submitting}
<Processing/>
{/if}