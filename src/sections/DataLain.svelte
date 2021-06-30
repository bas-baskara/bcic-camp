<script>
    import _ from 'lodash'
    import { navigate } from 'svelte-routing'
    import Swal from 'sweetalert2'
    import Processing from '@/extra/Processing.svelte'
    import ArrowCircleRight from '@/extra/ArrowCircleRight.svelte'
    import ArrowCircleLeft from '@/extra/ArrowCircleLeft.svelte'
    import Gallery from './Gallery.svelte'

    export let baseUrl
    let submitting = false

    let extraData = {
        id: null,
        had_prev_business: null,
        desc_prev_business: '',
        had_helped_other_business: null,
        family_owned_business: null,
        desc_family_business: ''
    }

    const getExtraData = (function() {
        fetch(baseUrl + 'other-data/' + sessionStorage.salt + '/' + sessionStorage.id_pendaftar)
        .then(response => response.json())
        .then(data => {
            if (data.status == 'ok') {
                const result = data.result
                for ( let key of Object.keys(extraData) ) {
                    if (key == 'desc_prev_business' || key == 'desc_family_business') {
                        extraData[key] = result[key] === null ? '':result[key]
                    } else {
                        extraData[key] = result[key]
                    }
                }
                extraData.id = result.id
            }
        })
    })

    getExtraData()

    function update(value, property) {
        extraData[property] = value
        const body = new FormData
        body.append(property, value)
        body.append('salt', sessionStorage.salt)
        body.append('id_pendaftar', sessionStorage.id_pendaftar)

        fetch(baseUrl + 'camp-other-datas', {
            method: 'POST',
            body
        })
        .then(response => response.json())
        .then(data => {
            getExtraData()
        })
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
        if ( data.step < 5 ) {
            Swal.fire({
                title: 'Data Belum Lengkap',
                text: 'Silakan lengkapi kolom yang harus diisi!',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#3984fb'
            })

            submitting = false
            return
        } else {
            navigate('/')
        }
    })
    .catch(err => {
        submitting = false

        setTimeout(() => {
            submitting = false
            Swal.fire({
                title: 'Gagal',
                text: 'Pastikan koneksi internet anda stabil!',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#3984fb'
            })
        }, 2000);
    })
}




</script>

<div class="my-4 border md:rounded md:border-blue-300">
    <div class="w-full p-2 bg-blue-300 font-bold text-white text-center md:font-medium md:text-lg md:rounded-t lg:text-3xl">Data Lainnya (wajib diisi)</div>

    <div class="text-xs p-2 md:text-sm md:px-6 lg:px-8 lg:text-base">

        <ol class="list-outside list-decimal px-4 space-y-4 md:space-y-6 lg:space-y-8 xl:space-y-10">
            <li>

                Saya pernah memiliki bisnis sebelum saya menjalankan bisnis yang Saya jalani sekarang.
                <div class="flex items-center gap-8 mb-2">
                    <div class="flex items-center gap-1">
                        <input id="own-business-1" type="radio" name="own-business" value="1" checked="{extraData.had_prev_business == 1}" on:change="{e => update(e.currentTarget.value, 'had_prev_business') }"> <label for="own-business-1">Ya</label>
                    </div>
                    <div class="flex items-center gap-1">
                        <input id="own-business-0" type="radio" name="own-business" value="0" checked="{extraData.had_prev_business == 0}" on:change="{e => update(e.currentTarget.value, 'had_prev_business') }"> <label for="own-business-0">Tidak</label>
                    </div>
                    <div class="text-xs text-red-500 {extraData.had_prev_business === null ? 'block':'hidden'}">*harus diisi</div>
                </div>


                <div class="{extraData.had_prev_business != 1 ? 'hidden':''} p-2">
                    <p>Jika Ya, jelaskan jenis usahanya dan berapa lama bisnis tersebut berjalan (contoh: 2 tahun 3 bulan):</p>
                    <textarea rows="3" class="p-2 w-full border rounded {extraData.had_prev_business == 1 && extraData.desc_prev_business.trim() == '' ? 'border-red-500':'border-blue-300'}" placeholder="Jelaskan jenis usahanya dan berapa lama bisnis tersebut berjalan!" bind:value="{extraData.desc_prev_business}" on:change="{e => update(e.currentTarget.value, 'desc_prev_business')}"></textarea>
                </div>

            </li>

            
            <li>
                Saya pernah membantu orang lain dalam menjalankan bisnis, walaupun saya tidak terlibat langsung dalam bisnis tersebut.

                <div class="flex items-center gap-8 mb-2">
                    <div class="flex items-center gap-1">
                        <input id="had-helped-other-business-1" type="radio" name="had_helped_other_business" value="1" checked="{extraData.had_helped_other_business == 1}" on:change="{e => update(e.currentTarget.value, 'had_helped_other_business')}"> <label for="had-helped-other-business-1">Ya</label>
                    </div>
                    <div class="flex items-center gap-1">
                        <input id="had-helped-other-business-0" type="radio" name="had_helped_other_business" value="0" checked="{extraData.had_helped_other_business == 0}" on:change="{e => update(e.currentTarget.value, 'had_helped_other_business')}"> <label for="had-helped-other-business-0">Tidak</label>
                    </div>
                    <div class="text-xs text-red-500 {extraData.had_helped_other_business === null ? 'block':'hidden'}">*harus diisi</div>
                </div>

            </li>
            
            <li>
                Keluarga saya memiliki bisnis.

                <div class="flex items-center gap-8 mb-2">
                    <div class="flex items-center gap-1">
                        <input id="family-own-business-1" type="radio" name="family-own-business" value="1" checked="{extraData.family_owned_business == 1}" on:change="{e => update(e.currentTarget.value, 'family_owned_business')}"> <label for="family-own-business-1">Ya</label>
                    </div>
                    <div class="flex items-center gap-1">
                        <input id="family-own-business-0" type="radio" name="family-own-business" value="0" checked="{extraData.family_owned_business == 0}" on:change="{e => update(e.currentTarget.value, 'family_owned_business')}"> <label for="family-own-business-0">Tidak</label>
                    </div>
                    <div class="text-xs text-red-500 {extraData.family_owned_business === null ? 'block':'hidden'}">*harus diisi</div>
                </div>

                <div class="{extraData.family_owned_business != 1 ? 'hidden':'block'} p-2">
                    <p>Jika Ya, Sebutkan nama, bidang, dan lama bisnis tersebut telah berjalan:</p>
                    <textarea rows="3"  class="p-2 w-full border rounded {extraData.family_owned_business == 1 && extraData.desc_family_business.trim() == '' ? 'border-red-500':'border-blue-300'}" placeholder="Sebutkan nama, bidang, dan lama bisnis tersebut telah berjalan" bind:value="{extraData.desc_family_business}" on:change="{e => update(e.currentTarget.value, 'desc_family_business')}"></textarea>
                </div>

            </li>
            
        </ol>

    </div>

</div>


<div class="p-2 flex justify-between">
    
    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{() => navigate('/profil-usaha')}"><ArrowCircleLeft/> Sebelumnya</button>

    <button class="flex items-center gap-2 rounded-full bg-blue-500 py-2 px-4 text-white text-sm md:font-medium md:text-base md:py-2 md:px-6 lg:py-3 lg:text-base lg:font-bold" on:click="{submit}">Lanjutkan <ArrowCircleRight/></button>
</div>


{#if submitting}
<Processing/>
{/if}