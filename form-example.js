
// 'number|boolean|required|minLength:8|maxLength:12|equalLength:4'
// 'mimeType:image/png,image/jpg,image/jpeg'
// maxSize:1024
// maxFile:1

const validator = new Validator('#form-example', {
    name: {
        label: 'how to do ramen?',
        data: 'required|number'
    },
    formFile: {
        label: 'Imagen',
        data: 'maxSize:1024'
    }
});

document.querySelector('.btn-primary').addEventListener('click', () => {

    validator.set_lang('es').init().then(res => {
        console.log(res)

    }).catch(err => {
        console.log(err)
    })

})