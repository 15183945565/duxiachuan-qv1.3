type FeatureClass<TInstance extends object = object> = abstract new (
    ...args: never[]
) => TInstance;

export interface StatelessFeatureCompositionOptions {
    readonly overrides?: readonly string[];
}

export interface StatefulFeatureComposition<TInstance extends object> {
    readonly componentClass: FeatureClass<TInstance>;
    initialize(target: TInstance): void;
}

/**
 * Installs a stateless feature class onto a Cocos component prototype.
 *
 * Feature classes used here may contain methods only. Their constructors are
 * intentionally never called, so stateful features must expose an explicit
 * initializer before they can be composed through this helper.
 */
export function composeStatelessFeature<
    TTarget extends object,
    TFeature extends object,
>(
    targetClass: FeatureClass<TTarget>,
    featureClass: FeatureClass<TFeature>,
    options: StatelessFeatureCompositionOptions = {},
): FeatureClass<TTarget & TFeature> {
    const targetPrototype = targetClass.prototype;
    const featurePrototype = featureClass.prototype;
    const allowedOverrides = new Set(options.overrides || []);
    const appliedOverrides = new Set<string>();

    for (const propertyName of Object.getOwnPropertyNames(featurePrototype)) {
        if (propertyName === 'constructor') continue;
        const overridesTarget = Object.prototype.hasOwnProperty.call(
            targetPrototype,
            propertyName,
        );
        if (overridesTarget && !allowedOverrides.has(propertyName)) {
            throw new Error(
                `Cannot compose ${featureClass.name}: `
                + `${targetClass.name}.${propertyName} already exists.`,
            );
        }
        if (overridesTarget) appliedOverrides.add(propertyName);

        const descriptor = Object.getOwnPropertyDescriptor(featurePrototype, propertyName);
        if (!descriptor) continue;
        Object.defineProperty(targetPrototype, propertyName, descriptor);
    }

    for (const overrideName of allowedOverrides) {
        if (!appliedOverrides.has(overrideName)) {
            throw new Error(
                `Cannot compose ${featureClass.name}: declared override `
                + `"${overrideName}" does not replace a target method.`,
            );
        }
    }

    // The returned constructor is the original target class. Only its
    // prototype is enriched, so no extra runtime inheritance layer is added.
    return targetClass as FeatureClass<TTarget & TFeature>;
}

export function composeStatefulFeature<
    TTarget extends object,
    TFeature extends object,
>(
    targetClass: FeatureClass<TTarget>,
    featureClass: FeatureClass<TFeature>,
    initializeFeatureState: (target: TTarget & TFeature) => void,
    options: StatelessFeatureCompositionOptions = {},
): StatefulFeatureComposition<TTarget & TFeature> {
    const componentClass = composeStatelessFeature(
        targetClass,
        featureClass,
        options,
    );
    const initializedTargets = new WeakSet<object>();

    return {
        componentClass,
        initialize(target): void {
            if (initializedTargets.has(target)) return;
            initializeFeatureState(target);
            initializedTargets.add(target);
        },
    };
}
