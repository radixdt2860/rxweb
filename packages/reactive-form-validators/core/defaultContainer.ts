import { DecoratorConfiguration, InstanceContainer, PropertyInfo } from './validator.interface';
import { Linq } from "../util/linq";
import { AnnotationTypes } from "./validator.static";
import { PROPERTY,OBJECT_PROPERTY,RXCODE } from "../const";

export const defaultContainer:
    {
        get<T>(instanceFunc: any): InstanceContainer,
        addAnnotation(instanceFunc: any, decoratorConfiguration: DecoratorConfiguration): void,
        addInstanceContainer(instanceFunc: any): void,
        addProperty(instanceFunc: any, propertyInfo: PropertyInfo): void,
        addChangeValidation(instance: InstanceContainer, propertyName: string, columns: any[]): void,
        init(target: any,parameterIndex:any,propertyKey:string, annotationType:string, config:any,isAsync:boolean) : void,
        initPropertyObject(name:string,propertyType:string,entity:any,target:any,config?:any) : void,
        modelIncrementCount:number,
        clearInstance(instance:any):void,
        setConditionalValueProp(instance: InstanceContainer, propName: string, refPropName: string): void,
        addDecoratorConfig(target: any, parameterIndex: any, propertyKey: string, config: any,decoratorType:string):void,
        setLogicalConditional(instance: any, annotationType: string, fieldName: string, propertyName: string): void,
        addSanitizer(target: any, parameterIndex: any, propertyKey: string, decoratorType: string):void
    } = new (class {
        private instances: InstanceContainer[] = [];
        modelIncrementCount:number = 0;
        get<T>(instanceFunc: any): InstanceContainer {
            let instance: InstanceContainer = this.instances.filter(instance => instance.instance === instanceFunc)[0];
            return instance;
        }

        getInstance(target: any, parameterIndex: any, propertyKey: string, decoratorType: string) {
            let isPropertyKey = (propertyKey != undefined);
            let instanceFunc = !isPropertyKey ? target : target.constructor
            let instance = this.instances.filter(instance => instance.instance === instanceFunc)[0];
            if (!instance)
                instance = this.addInstanceContainer(instanceFunc);
            return instance;
        }

        addSanitizer(target: any, parameterIndex: any, propertyKey: string, decoratorType: string) {
            let instance = this.getInstance(target, parameterIndex, propertyKey, decoratorType);
            if (instance) {
                if (!instance.sanitizers[propertyKey])
                    instance.sanitizers[propertyKey] = [];
                instance.sanitizers[propertyKey].push(decoratorType);
            }
        }

        addDecoratorConfig(target: any, parameterIndex: any, propertyKey: string, config: any,decoratorType:string): void {
            let isPropertyKey = (propertyKey != undefined);
            let instanceFunc = !isPropertyKey ? target : target.constructor
            let instance = this.instances.filter(instance => instance.instance === instanceFunc)[0];
            if (!instance)
                instance = this.addInstanceContainer(instanceFunc);
            instance.nonValidationDecorators[decoratorType].conditionalExpressions[propertyKey] = config.conditionalExpression;
            let columns = Linq.expressionColumns(config.conditionalExpression,true);
            columns.forEach(column => {
                let columnName = (!column.objectPropName) ? `${column.propName}${RXCODE}${column.argumentIndex}` : `${column.objectPropName}.${column.propName}${RXCODE}${column.argumentIndex}`;
                if (!instance.nonValidationDecorators[decoratorType].changeDetection[columnName]) 
                    instance.nonValidationDecorators[decoratorType].changeDetection[columnName] = [];
                let disabledColumns = instance.nonValidationDecorators[decoratorType].changeDetection[columnName];
                if (disabledColumns.indexOf(columnName) === -1)
                    disabledColumns.push(propertyKey);
            })
        }


        init(target:any,parameterIndex: any, propertyKey: string, annotationType: string, config: any,isAsync:boolean): void {
          var decoratorConfiguration: DecoratorConfiguration = {
            propertyIndex: parameterIndex,
            propertyName: propertyKey,
            annotationType: annotationType,
            config: config,
            isAsync:isAsync
          }
          let isPropertyKey = (propertyKey != undefined);
          this.addAnnotation(!isPropertyKey ? target : target.constructor, decoratorConfiguration);  
        }

        initPropertyObject(name:string,propertyType:string,entity:any,target:any,config?:any){
            var propertyInfo: PropertyInfo = {
                name: name,
                propertyType: propertyType,
                entity: entity,
                dataPropertyName: config ? config.name : undefined
            }
            defaultContainer.addProperty(target.constructor, propertyInfo);
        }

        addInstanceContainer(instanceFunc: any): InstanceContainer {
            let instanceContainer: InstanceContainer = {
                instance: instanceFunc,
                propertyAnnotations: [],
                properties: [],
                nonValidationDecorators: {
                    disabled: {
                        conditionalExpressions: {},
                        changeDetection: {}
                    },error: {
                        conditionalExpressions: {},
                        changeDetection: {}
                    }
                },
                sanitizers: {}
            }
            this.instances.push(instanceContainer);
            return instanceContainer;
        }


        addProperty(instanceFunc: any, propertyInfo: PropertyInfo,isFromAnnotation:boolean = false): void {
            let instance = this.instances.filter(instance => instance.instance === instanceFunc)[0];
            if (instance) {
                this.addPropertyInfo(instance, propertyInfo,!isFromAnnotation);
            }
            else {
                instance = this.addInstanceContainer(instanceFunc);
                this.addPropertyInfo(instance, propertyInfo);
            }
        }

        addPropertyInfo(instance: InstanceContainer, propertyInfo: PropertyInfo,isAddProperty:boolean = false) {
            var property = this.getProperty(instance,propertyInfo);
            if (!property)
                instance.properties.push(propertyInfo);
            else if(isAddProperty)
                this.updateProperty(property,propertyInfo);
        }

        addAnnotation(instanceFunc: any, decoratorConfiguration: DecoratorConfiguration): void {
            this.addProperty(instanceFunc, { propertyType: PROPERTY, name: decoratorConfiguration.propertyName },true);
            let instance = this.instances.filter(instance => instance.instance === instanceFunc)[0];
            if (instance)
                instance.propertyAnnotations.push(decoratorConfiguration);
            else {
                instance = this.addInstanceContainer(instanceFunc);
                instance.propertyAnnotations.push(decoratorConfiguration);
            }
            if (decoratorConfiguration.config && decoratorConfiguration.config.conditionalExpression) {
                let columns = Linq.expressionColumns(decoratorConfiguration.config.conditionalExpression);
                this.addChangeValidation(instance, decoratorConfiguration.propertyName, columns);
            }
            this.setConditionalColumns(instance,decoratorConfiguration);
        }

        setConditionalColumns(instance: any, decoratorConfiguration: DecoratorConfiguration){
            if(instance && decoratorConfiguration.config ){
                if(decoratorConfiguration.annotationType == AnnotationTypes.and || decoratorConfiguration.annotationType == AnnotationTypes.or || decoratorConfiguration.annotationType == AnnotationTypes.not){
                    Object.keys(decoratorConfiguration.config.validation).forEach(t=>{
                        if(typeof decoratorConfiguration.config.validation[t] !== "boolean")
                            this.setLogicalConditional(instance,t,decoratorConfiguration.config.validation[t].fieldName,decoratorConfiguration.propertyName)
                    })
                }else
                    this.setLogicalConditional(instance,decoratorConfiguration.annotationType,decoratorConfiguration.config.fieldName,decoratorConfiguration.propertyName);
            }
        }

        setLogicalConditional(instance:any,annotationType:string,fieldName:string,propertyName:string){
            if (instance  && ((annotationType == AnnotationTypes.compare || annotationType == AnnotationTypes.greaterThan || annotationType == AnnotationTypes.greaterThanEqualTo || annotationType == AnnotationTypes.lessThan || annotationType == AnnotationTypes.lessThanEqualTo  || annotationType == AnnotationTypes.different  || annotationType == AnnotationTypes.factor) || (annotationType == AnnotationTypes.creditCard && fieldName) || ((annotationType == AnnotationTypes.minDate || annotationType == AnnotationTypes.maxDate) && fieldName))) {
                this.setConditionalValueProp(instance, fieldName, propertyName)
            }
        }
        setConditionalValueProp(instance: InstanceContainer, propName: string, refPropName: string) {
            if (!instance.conditionalValidationProps)
                instance.conditionalValidationProps = {};
            if (!instance.conditionalValidationProps[propName])
                instance.conditionalValidationProps[propName] = [];
            if (instance.conditionalValidationProps[propName].indexOf(refPropName) == -1)
                instance.conditionalValidationProps[propName].push(refPropName);
        }
        addChangeValidation(instance: InstanceContainer, propertyName: string, columns: any[]) :void {
            if (instance) {
                if (!instance.conditionalValidationProps)
                    instance.conditionalValidationProps = {};

                columns.forEach(t => {
                    if (t.propName && !t.objectPropName) {
                        if (!instance.conditionalValidationProps[t.propName])
                            instance.conditionalValidationProps[t.propName] = [];
                        if (instance.conditionalValidationProps[t.propName].indexOf(propertyName) == -1)
                            instance.conditionalValidationProps[t.propName].push(propertyName);
                    } else {
                        if (t.propName && t.objectPropName) {
                            if (!instance.conditionalObjectProps)
                                instance.conditionalObjectProps = [];
                            t.referencePropName = propertyName;
                            instance.conditionalObjectProps.push(t);
                        }
                    }
                })
            }
        }

      clearInstance(instanceFunc:any){
        let instance = this.instances.filter(instance => instance.instance === instanceFunc)[0];
        if(instance){
        let indexOf = this.instances.indexOf(instance);
        this.instances.splice(indexOf,1);
        }
      }

      getProperty(instance: InstanceContainer, propertyInfo: PropertyInfo) {
        return instance.properties.filter(t => t.name == propertyInfo.name)[0]
      }

      updateProperty(property:PropertyInfo,currentProperty:PropertyInfo){
        property.dataPropertyName = currentProperty.dataPropertyName;
        property.defaultValue = currentProperty.defaultValue;
      }
    })();
