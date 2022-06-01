'use strict';

/**
 * Validador de datos de formularios.
 * @author Jonás Damián Hernández
 * @since 22/05/2022
 */
class Validator {

    /**
     * 
     * @param {*} element_form ID de formulario
     * @param {*} validations Objeto con validaciones de cada input del formulario
     */
    constructor(element_form, validations) {
        this.element_form = element_form
        this.form = document.querySelector(element_form);
        this.validations = validations;
        this.lang = 'es';
        this.reset();
    }

    reset() {
        this.success = true;
        this.errors = [];
    }

    get_data_form() {

        const form_data = new FormData(this.form);
        this.form_data = form_data;

        for (let object of form_data) {

            const name_field = object[0];
            const value = object[1];

            const validation = this.validations[name_field];

            if (validation) {
                this.check(name_field, value, validation);
            }
        }

    }

    required(name_field, value) {

        if (value == '') {
            this.set_error(name_field, 'required');
        }
    }

    number(name_field, value) {

        const reg = new RegExp(/^[0-9]+$/);
        if (!reg.test(value)) {
            this.set_error(name_field, 'number');
        }
    }

    boolean(name_field, value) {

        const reg = new RegExp(/^[0|1]$/);
        if (!reg.test(value)) {
            this.set_error(name_field, 'boolean');
        }
    }

    minLength(name_field, value, min_length) {

        if (value.length < min_length) {
            this.set_error(name_field, 'minLength', [{ key: 'num', value: min_length }]);
        }
    }

    maxLength(name_field, value, max_length) {
        if (value.length > max_length) {
            this.set_error(name_field, 'maxLength', [{ key: 'num', value: max_length }]);
        }
    }

    equalLength(name_field, value, equal_length) {
        if (value.length != equal_length) {
            this.set_error(name_field, 'equalLength', [{ key: 'num', value: equal_length }]);
        }
    }

    maxSize(name_field, file, max) {
        console.log(name_field, file, max)
    }

    check(name_field, value, validation) {

        const list_validation = validation.data.split('|');

        list_validation.forEach(validate => {

            // si la validación contiene ":"
            if (validate.search(':') !== -1) {

                const validate_with_params = validate.split(':');
                const name_method = validate_with_params[0];
                const param = validate_with_params[1];

                if (typeof this[name_method] == 'function') {
                    this[name_method](name_field, value, param);
                }

            } else {

                if (typeof this[validate] == 'function') {
                    this[validate](name_field, value);
                }
            }
        });
    }

    message_error(property_message = null) {
        const messages = {
            es: {
                number: 'El campo :field solo pueden ser números.',
                boolean: 'El campo :field solo puede tener el valor 0 o 1.',
                required: 'El campo :field es obligatorio.',
                minLength: 'El campo :field requiere al menos :num carácteres.',
                maxLength: 'El campo :field no puede tener más de :num carácteres.',
                equalLength: 'El campo :field debe tener exactamente :num carácteres.',
            }
        };

        let selected = messages[this.lang];

        if (property_message != null) {
            selected = selected[property_message];
        }
        return selected;
    }

    set_error(name_field, property, more_properties = null) {

        let err = this.message_error(property);

        // Label personalizado
        if (this.validations[name_field].hasOwnProperty('label')) {
            let custom_label = this.validations[name_field].label;
            err = err.replace(':field', custom_label);
        } else {// Label por defecto en formulario
            for (let label of this.labels) {
                if (label.getAttribute('for') == name_field) {
                    err = err.replace(':field', label.innerHTML.trim());
                }
            }
        }

        // Si no tiene label mostrará el valor del atributo name del input
        if (err.search(':field') === -1) {
            err = err.replace(':field', name_field);
        }

        if (more_properties != null) {
            for (let prop of more_properties) {
                err = err.replace(`:${prop.key}`, prop.value);
            }
        }

        let data = {};
        data[name_field] = err;
        this.success = false;
        this.errors.push(data);
    }

    get_labels(list = [], labels = []) {

        for (let el of list) {

            if (el.tagName === 'DIV') {

                let div = el.children;
                this.get_labels(div, labels);
            } else if (el.tagName === 'LABEL') {
                labels.push(el);
            }
        }
        return labels;
    }

    get_inputs(list = [], inputs = []) {

        for (let el of list) {

            if (el.tagName === 'DIV') {

                let div = el.children;
                this.get_inputs(div, inputs);
            } else if (['INPUT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'DATALIST'].includes(el.tagName)) {
                inputs.push(el);
            }
        }
        return inputs;
    }

    remove_message_errors() {

        for (let label of this.labels) {

            let parent_label = label.parentElement;

            // Borrar antiguos mensajes
            let old_messages = parent_label.querySelectorAll('.message-validate');

            if (old_messages.length) {
                for (let old_error of old_messages) {
                    old_error.remove();
                }
            }
        }
    }

    show_errors_messages() {

        for (let label of this.labels) {
            let parent_label = label.parentElement;

            // Añadir nuevos mensajes de error
            if (this.errors.length) {
                for (let error of this.errors) {

                    let key = Object.keys(error)[0];

                    if (label.getAttribute('for') == key) {

                        let style = `
                        display: block;
                        color: #db1212;
                        font-size: 13px;
                        margin-top: 5px;
                        font-weight: bold;`;

                        parent_label.innerHTML += `<span class="message-validate" style="${style}">${error[key]}</span>`;
                    }
                }
            }
        }
    }

    show_error_inputs() {

        for (let input of this.inputs) {

            let is_valid = true;
            // Añadir nuevos mensajes de error
            if (this.errors.length) {
                for (let error of this.errors) {

                    let key = Object.keys(error)[0];

                    if (input.getAttribute('name') == key) {
                        is_valid = false;
                    }
                }
            }

            if (is_valid) {
                input.removeAttribute('invalid');
            } else {
                input.setAttribute('invalid', '');
            }

        }
    }

    show_errors() {
        this.show_errors_messages();
        this.show_error_inputs()
    }


    init() {
        return new Promise((resolve, reject) => {
            this.reset();
            this.labels = this.get_labels(this.form.children);
            this.inputs = this.get_inputs(this.form.children);
            this.remove_message_errors();
            this.get_data_form();

            if (!this.success) {
                this.show_errors();

                reject(this.errors);
            }


            resolve(this.form_data);
        })
    }

    set_lang(lang) {
        this.lang = lang;
        return this;
    }
}
