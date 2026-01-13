/**
 * MOCK TEMPLATE LIBRARY (Phase 5.3)
 * 
 * A representative set of LFA templates to validate the matching algorithm.
 * These covers:
 * - Themes: FLN, Teacher Dev, Health, Livelihood
 * - Geographies: Rural, Urban, State, District
 * - Targets: Students, Teachers, Women, Youth, Community
 */

export const MOCK_TEMPLATES = [
    // --- THEME: EDUCATION (FLN) ---
    {
        id: 'tpl_edu_fln_rural_dist',
        name: 'District-Level FLN Transformation (Rural)',
        description: 'A comprehensive intervention to improve Foundational Literacy and Numeracy in rural districts through community volunteers and teacher training.',
        theme: 'EDUCATION_FLN',
        isSystem: true,
        mapping: {
            primaryTheme: 'EDUCATION_FLN',
            secondaryThemes: ['COMMUNITY_ENGAGEMENT'],
            geographyLevel: ['DISTRICT', 'RURAL', 'BLOCK'],
            targetGroups: ['STUDENTS', 'TEACHERS', 'PARENTS']
        },
        content: {}
    },
    {
        id: 'tpl_edu_fln_urban_slum',
        name: 'Urban Slum FLN Bridge Course',
        description: 'Targeted bridge courses for out-of-school children in urban slums to reintegrate them into the formal schooling system.',
        theme: 'EDUCATION_FLN',
        isSystem: true,
        mapping: {
            primaryTheme: 'EDUCATION_FLN',
            secondaryThemes: ['CHILD_PROTECTION'],
            geographyLevel: ['URBAN', 'WARD'],
            targetGroups: ['STUDENTS', 'YOUTH']
        },
        content: {}
    },

    // --- THEME: TEACHER DEVELOPMENT ---
    {
        id: 'tpl_edu_teacher_state',
        name: 'State-Wide Digital Teacher Training',
        description: 'Large-scale rollout of digital pedagogy training for government school teachers using a cascade model.',
        theme: 'EDUCATION_TEACHER_DEV',
        isSystem: true,
        mapping: {
            primaryTheme: 'EDUCATION_TEACHER_DEV',
            secondaryThemes: ['DIGITAL_LITERACY'],
            geographyLevel: ['STATE'],
            targetGroups: ['TEACHERS', 'GOVT_OFFICIALS']
        },
        content: {}
    },
    {
        id: 'tpl_edu_headmaster_leadership',
        name: 'School Leadership Development Program',
        description: 'Empowering school headmasters with management and leadership skills to improve school governance.',
        theme: 'EDUCATION_TEACHER_DEV',
        isSystem: true,
        mapping: {
            primaryTheme: 'EDUCATION_TEACHER_DEV',
            geographyLevel: ['DISTRICT', 'BLOCK'],
            targetGroups: ['TEACHERS', 'GOVT_OFFICIALS'] // Headmasters mapped to Teachers/Officials
        },
        content: {}
    },

    // --- THEME: MATERNAL HEALTH ---
    {
        id: 'tpl_health_maternal_rural',
        name: 'Rural Ante-Natal Care Access',
        description: 'Improving access to ANC services in remote rural villages using ASHA workers and mobile clinics.',
        theme: 'HEALTH_MATERNAL',
        isSystem: true,
        mapping: {
            primaryTheme: 'HEALTH_MATERNAL',
            secondaryThemes: ['COMMUNITY_ENGAGEMENT'],
            geographyLevel: ['RURAL', 'VILLAGE'],
            targetGroups: ['WOMEN', 'COMMUNITY', 'GOVT_OFFICIALS'] // ASHA workers
        },
        content: {}
    },
    {
        id: 'tpl_health_nutrition_urban',
        name: 'Urban Anganwadi Nutrition Upgrade',
        description: 'Strengthening nutritional outcomes for children and mothers in urban Anganwadi centers.',
        theme: 'HEALTH_MATERNAL',
        isSystem: true,
        mapping: {
            primaryTheme: 'HEALTH_MATERNAL',
            secondaryThemes: ['NUTRITION'],
            geographyLevel: ['URBAN', 'WARD'],
            targetGroups: ['WOMEN', 'STUDENTS'] // Students meaning young children here
        },
        content: {}
    },

    // --- THEME: LIVELIHOOD & SKILLS ---
    {
        id: 'tpl_live_youth_vocational',
        name: 'Youth Vocational Skills & Placement',
        description: 'Short-term technical skills training for unemployed youth linked to market placement.',
        theme: 'LIVELIHOOD_SKILLS',
        isSystem: true,
        mapping: {
            primaryTheme: 'LIVELIHOOD_SKILLS',
            secondaryThemes: ['PRIVATE_SECTOR'],
            geographyLevel: ['DISTRICT', 'URBAN', 'RURAL'], // Broad applicability
            targetGroups: ['YOUTH']
        },
        content: {}
    },
    {
        id: 'tpl_live_women_shg',
        name: 'Women SHG Entrepreneurship',
        description: 'Empowering women via Self-Help Groups to start micro-enterprises in rural areas.',
        theme: 'LIVELIHOOD_SKILLS',
        isSystem: true,
        mapping: {
            primaryTheme: 'LIVELIHOOD_SKILLS',
            secondaryThemes: ['FINANCIAL_INCLUSION'],
            geographyLevel: ['RURAL', 'VILLAGE'],
            targetGroups: ['WOMEN', 'COMMUNITY']
        },
        content: {}
    }
];
