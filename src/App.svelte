<script>
	import { Router, Route } from 'svelte-routing'

    import Heading from '@/components/Heading.svelte'
    import Footer from '@/components/Footer.svelte'


	import Biodata from '@/sections/Biodata.svelte'
	import EduAchievement from '@/sections/EduAchievement.svelte'
	import Experiences from '@/sections/Experiences.svelte'
	import BusinessProfile from '@/sections/BusinessProfile.svelte'
	import DataLain from '@/sections/DataLain.svelte'
	let url = ''
	// const baseUrl = 'https://sentra.test/api/camp-bcic/'
	const baseUrl = 'https://smartsentra.kemenperin.go.id/api/camp-bcic/'

	
	function authorizing() {
		if ( !sessionStorage.salt || !sessionStorage.id_pendaftar ) {
			location.href = "/form-pendaftaran"
		}

		const formData = new FormData
		formData.append('salt', sessionStorage.salt)
		formData.append('id_pendaftar', sessionStorage.id_pendaftar)

		fetch(baseUrl + 'verify-registrant', {
			method: 'POST',
			body: formData
		})
		.then(response => {
			console.log('response', response)
			if ( response.status !== 200 ) {
				sessionStorage.clear()
				location.href = "/form-pendaftaran"
			}
		})
	}
	authorizing()

</script>

<div class="px-0 md:px-20 xl:max-w-screen-xl xl:mx-auto xl:px-24">

	<Heading/>

	<Router url={url}>
		
		<Route path="/camp-bcic/form/biodata">
			<Biodata {baseUrl}/>
		</Route>

		<Route path="/camp-bcic/form/pendidikan-dan-pencapaian">
			<EduAchievement {baseUrl}/>
		</Route>

		<Route path="/camp-bcic/form/pengalaman-kerja-dan-organisasi">
			<Experiences {baseUrl}/>
		</Route>

		<Route path="/camp-bcic/form/profil-usaha">
			<BusinessProfile {baseUrl}/>
		</Route>

		<Route path="/camp-bcic/form/data-lainnya">
			<DataLain {baseUrl}/>
		</Route>

	</Router>

</div>

<Footer/>


<style global lang="postcss">
	@tailwind base;
	@tailwind components;

		.tooltip {
		@apply invisible absolute;
		}

		.has-tooltip:hover .tooltip {
		@apply visible z-50;
		}

	@tailwind utilities;
</style>